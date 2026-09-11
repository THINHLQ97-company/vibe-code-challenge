import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signSession, toSessionPayload, AUTH_COOKIE } from "@/lib/auth/session";
import { resolveDepartmentCode, resolveBoard } from "@/lib/department";
import {
  getMicrosoftConfig,
  getRedirectUri,
  exchangeCode,
  verifyIdToken,
  fetchGraphProfile,
} from "@/lib/auth/microsoft";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "vcc_ms_state";
const VERIFIER_COOKIE = "vcc_ms_verifier";

function fail(req: NextRequest, code: string) {
  const res = NextResponse.redirect(new URL(`/login?error=${code}`, req.url));
  res.cookies.delete(STATE_COOKIE);
  res.cookies.delete(VERIFIER_COOKIE);
  return res;
}

export async function GET(req: NextRequest) {
  const config = getMicrosoftConfig();
  if (!config) return fail(req, "ms_chua_cau_hinh");

  // Microsoft báo lỗi ngay ở bước đồng ý (người dùng bấm huỷ, quản trị chưa cấp quyền…).
  if (req.nextUrl.searchParams.get("error")) return fail(req, "ms_tu_choi");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;
  const verifier = req.cookies.get(VERIFIER_COOKIE)?.value;

  /**
   * So `state` với giá trị đã cất trong cookie. Thiếu bước này thì kẻ tấn công dụ được người dùng
   * mở một địa chỉ callback dựng sẵn và ghép phiên của họ vào tài khoản của kẻ tấn công.
   */
  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return fail(req, "ms_phien_khong_hop_le");
  }

  let email: string;
  let subject: string;
  let displayName: string | null;
  let departmentRaw: string | null = null;
  let employeeId: string | null = null;

  try {
    const { idToken, accessToken } = await exchangeCode({
      config,
      code,
      redirectUri: getRedirectUri(req),
      codeVerifier: verifier,
    });
    const claims = await verifyIdToken(config, idToken);

    const claimEmail = claims.email ?? claims.preferred_username ?? null;
    // `oid` là mã người dùng ỔN ĐỊNH trong tenant — dùng nó làm khoá nối tài khoản, không dùng
    // email: nhân sự đổi tên thì email đổi theo, mà đổi email không được phép biến họ thành một
    // thí sinh mới với bảng điểm trắng.
    const claimSubject = claims.oid ?? claims.sub ?? null;
    if (!claimEmail || !claimSubject) return fail(req, "ms_thieu_thong_tin");

    const profile = await fetchGraphProfile(accessToken);
    email = claimEmail.toLowerCase();
    subject = claimSubject;
    displayName = profile?.displayName ?? claims.name ?? null;
    departmentRaw = profile?.department ?? null;
    employeeId = profile?.employeeId ?? null;
  } catch {
    return fail(req, "ms_that_bai");
  }

  /**
   * Chặn thêm ở tầng ứng dụng dù app đã đăng ký single-tenant. Hai lớp cho cùng một luật vì chi
   * phí bằng không, còn nếu sau này ai đó đổi app sang multi-tenant để tiện việc khác thì lớp này
   * vẫn giữ đúng thể lệ "chỉ nhân sự Mắt Bão dự thi".
   */
  if (!email.endsWith("@matbao.com")) return fail(req, "ms_ngoai_cong_ty");

  const deptCode = resolveDepartmentCode(departmentRaw);
  const board = resolveBoard(deptCode);

  // Nối theo `oauthSubject` trước, sau đó mới tới email — để người đổi email vẫn là chính họ.
  const bySubject = await db.query.users.findFirst({ where: eq(users.oauthSubject, subject) });
  const existing = bySubject ?? (await db.query.users.findFirst({ where: eq(users.email, email) }));

  let user;
  if (existing) {
    /**
     * Cập nhật phòng ban theo Graph, nhưng CHỈ khi quy đổi ra mã hợp lệ. Graph trả chuỗi lạ không
     * khớp bảng quy đổi thì giữ nguyên phòng ban cũ — ghi đè bằng `null` sẽ xoá mất lựa chọn người
     * dùng đã tự đặt, và đẩy họ ra khỏi bảng thi giữa mùa.
     */
    [user] = await db
      .update(users)
      .set({
        oauthProvider: "microsoft",
        oauthSubject: subject,
        email,
        name: displayName ?? existing.name,
        departmentRaw: departmentRaw ?? existing.departmentRaw,
        ...(deptCode ? { department: deptCode, board } : {}),
        ...(employeeId && !existing.employeeCode ? { employeeCode: employeeId } : {}),
      })
      .where(eq(users.id, existing.id))
      .returning();
  } else {
    [user] = await db
      .insert(users)
      .values({
        email,
        name: displayName,
        // Không đặt `passwordHash`: tài khoản này không có đường đăng nhập bằng mật khẩu.
        oauthProvider: "microsoft",
        oauthSubject: subject,
        department: deptCode,
        board,
        departmentRaw,
        employeeCode: employeeId,
        role: "candidate",
      })
      .returning();
  }

  const token = await signSession(toSessionPayload(user));
  /**
   * Chưa xếp được phòng ban thì đưa thẳng tới màn hồ sơ để chọn, kèm ghi chú lý do. Thả họ vào
   * trang tổng quan với bảng thi trống là kiểu lỗi im lặng — mọi thứ trông vẫn chạy cho tới lúc
   * xếp hạng mới lòi ra.
   */
  const dest = user.department ? "/dashboard" : "/dashboard/profile?canhbao=chua_co_phong_ban";
  const res = NextResponse.redirect(new URL(dest, req.url));
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.delete(STATE_COOKIE);
  res.cookies.delete(VERIFIER_COOKIE);
  return res;
}
