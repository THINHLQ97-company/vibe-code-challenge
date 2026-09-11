import { NextRequest, NextResponse } from "next/server";
import {
  getMicrosoftConfig,
  getRedirectUri,
  buildAuthorizeUrl,
  createPkcePair,
  randomToken,
} from "@/lib/auth/microsoft";

export const dynamic = "force-dynamic";

/** Cookie tạm, chỉ sống đúng quãng người dùng đi sang Microsoft rồi quay về. */
const STATE_COOKIE = "vcc_ms_state";
const VERIFIER_COOKIE = "vcc_ms_verifier";
const TEMP_MAX_AGE = 10 * 60;

export async function GET(req: NextRequest) {
  const config = getMicrosoftConfig();
  if (!config) {
    // Chưa có thông tin app từ đội quản lý tenant. Nói thẳng lý do thay vì ném 500 khó hiểu.
    return NextResponse.redirect(new URL("/login?error=ms_chua_cau_hinh", req.url));
  }

  const { verifier, challenge } = await createPkcePair();
  const state = randomToken();
  const redirectUri = getRedirectUri(req);

  const res = NextResponse.redirect(
    buildAuthorizeUrl({ config, redirectUri, state, codeChallenge: challenge })
  );
  /**
   * `sameSite: "lax"` chứ không phải `"strict"`: Microsoft chuyển người dùng về bằng một điều
   * hướng từ tên miền khác, mà `strict` thì trình duyệt KHÔNG gửi cookie trong lần điều hướng đó —
   * khi ấy route callback không thấy state lẫn verifier và mọi lần đăng nhập đều thất bại.
   */
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TEMP_MAX_AGE,
  };
  res.cookies.set(STATE_COOKIE, state, opts);
  res.cookies.set(VERIFIER_COOKIE, verifier, opts);
  return res;
}
