import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getWave, updateWave } from "@/lib/db/queries/waves";
import { ensurePostingSlots } from "@/lib/db/queries/posting-slots";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  registrationOpensAt: z.string().datetime({ offset: true }).optional(),
  registrationClosesAt: z.string().datetime({ offset: true }).optional(),
  capacityKyThuat: z.number().int().min(0).max(500).optional(),
  capacityVanPhong: z.number().int().min(0).max(500).optional(),
  bonusPoints: z.number().int().min(0).max(20).optional(),
  status: z.enum(["draft", "open", "closed"]).optional(),

  /**
   * Các mốc lịch phía sau đăng ký. Nhận `null` để XOÁ mốc — khác hẳn với việc bỏ trống trường
   * (không gửi), vốn nghĩa là "giữ nguyên". Thiếu phân biệt này thì ban tổ chức không có cách nào
   * gỡ một ngày đã điền nhầm.
   */
  phase2OpensAt: z.string().datetime({ offset: true }).nullable().optional(),
  phase2ClosesAt: z.string().datetime({ offset: true }).nullable().optional(),
  postingOpensAt: z.string().datetime({ offset: true }).nullable().optional(),
  postingClosesAt: z.string().datetime({ offset: true }).nullable().optional(),
  completedAt: z.string().datetime({ offset: true }).nullable().optional(),
  /** Ngày chấm dạng YYYY-MM-DD, đủ vì lượt chấm tính theo ngày chứ không theo giờ. */
  judgingDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày chấm phải dạng YYYY-MM-DD")).max(10).optional(),
});

/** `undefined` = giữ nguyên, `null` = xoá mốc, chuỗi = đặt mốc mới. */
function dateField(value: string | null | undefined): { v: Date | null } | null {
  if (value === undefined) return null;
  return { v: value === null ? null : new Date(value) };
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const wave = await getWave(id);
  if (!wave) return NextResponse.json({ error: "Không tìm thấy đợt thi" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  const opens = d.registrationOpensAt ? new Date(d.registrationOpensAt) : wave.registrationOpensAt;
  const closes = d.registrationClosesAt
    ? new Date(d.registrationClosesAt)
    : wave.registrationClosesAt;
  if (closes <= opens) {
    return NextResponse.json({ error: "Giờ đóng đăng ký phải sau giờ mở" }, { status: 400 });
  }

  const p2Open = dateField(d.phase2OpensAt);
  const p2Close = dateField(d.phase2ClosesAt);
  const postOpen = dateField(d.postingOpensAt);
  const postClose = dateField(d.postingClosesAt);
  const done = dateField(d.completedAt);

  // Hai mốc đầu/cuối của cùng một khoảng phải đúng thứ tự, kể cả khi chỉ một trong hai được gửi.
  const effP2Open = p2Open ? p2Open.v : wave.phase2OpensAt;
  const effP2Close = p2Close ? p2Close.v : wave.phase2ClosesAt;
  if (effP2Open && effP2Close && effP2Close <= effP2Open) {
    return NextResponse.json({ error: "Hạn nộp phải sau ngày bắt đầu làm bài" }, { status: 400 });
  }
  const effPostOpen = postOpen ? postOpen.v : wave.postingOpensAt;
  const effPostClose = postClose ? postClose.v : wave.postingClosesAt;
  if (effPostOpen && effPostClose && effPostClose <= effPostOpen) {
    return NextResponse.json(
      { error: "Ngày đóng cửa sổ đăng bài phải sau ngày mở" },
      { status: 400 }
    );
  }

  const row = await updateWave(id, {
    ...(p2Open ? { phase2OpensAt: p2Open.v } : {}),
    ...(p2Close ? { phase2ClosesAt: p2Close.v } : {}),
    ...(postOpen ? { postingOpensAt: postOpen.v } : {}),
    ...(postClose ? { postingClosesAt: postClose.v } : {}),
    ...(done ? { completedAt: done.v } : {}),
    ...(d.judgingDates !== undefined ? { judgingDates: d.judgingDates } : {}),
    ...(d.name !== undefined ? { name: d.name } : {}),
    ...(d.capacityKyThuat !== undefined ? { capacityKyThuat: d.capacityKyThuat } : {}),
    ...(d.capacityVanPhong !== undefined ? { capacityVanPhong: d.capacityVanPhong } : {}),
    // `capacity` là TỔNG, giữ đồng bộ để mọi nơi đang đọc nó không lệch.
    ...(d.capacityKyThuat !== undefined || d.capacityVanPhong !== undefined
      ? {
          capacity:
            (d.capacityKyThuat ?? wave.capacityKyThuat) +
            (d.capacityVanPhong ?? wave.capacityVanPhong),
        }
      : {}),
    ...(d.bonusPoints !== undefined ? { bonusPoints: d.bonusPoints } : {}),
    ...(d.status !== undefined ? { status: d.status } : {}),
    registrationOpensAt: opens,
    registrationClosesAt: closes,
  });
  /**
   * Cửa sổ đăng bài đổi thì dựng lại khung giờ ngay, không đợi ai mở trang.
   *
   * Nếu để dựng lười lúc thí sinh vào xem, thì giữa lúc ban tổ chức lưu lịch và lúc người đầu tiên
   * mở trang, màn quản lý hiện một cửa sổ đăng bài chưa có khung nào bên dưới — trông như lưu hụt.
   */
  if (postOpen || postClose) await ensurePostingSlots(id);

  return NextResponse.json({ wave: row });
}
