import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { bookPostingSlot } from "@/lib/db/queries/posting-slots";
import { periodLabel, periodTimeLabel } from "@/lib/contest-schedule";
import { formatDateVN } from "@/lib/datetime";

const schema = z.object({ slotId: z.number().int().positive() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["candidate"]);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const submission = await getSubmissionById(Number(id));
  if (!submission || submission.userId !== auth.session.userId) {
    return NextResponse.json({ error: "Không tìm thấy bài dự thi" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Khung giờ không hợp lệ" }, { status: 400 });
  }

  if (submission.currentPhase < 3) {
    return NextResponse.json(
      { error: "Chưa tới bước chia sẻ — ban tổ chức cần duyệt Phase 2 trước" },
      { status: 409 }
    );
  }

  /**
   * Đổi khung chỉ được TRƯỚC KHI bài lên nhóm.
   *
   * Sau khi thí sinh đã dán link, ban tổ chức đã xếp bài đó vào hàng duyệt của khung đã đặt. Đổi
   * lúc ấy nghĩa là bài nằm một khung còn lịch duyệt ghi một khung khác, và người trực duyệt sẽ
   * tìm không ra nó.
   */
  if (submission.facebookPostUrl && submission.postingSlotId) {
    return NextResponse.json(
      { error: "Bạn đã gửi link bài đăng — đổi khung giờ lúc này cần ban tổ chức hỗ trợ" },
      { status: 409 }
    );
  }

  const result = await bookPostingSlot(submission.id, parsed.data.slotId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });

  return NextResponse.json({
    slotId: result.slot.id,
    moved: result.moved,
    label: `${periodLabel(result.slot.period)} ${formatDateVN(result.slot.startsAt)} · ${periodTimeLabel(result.slot.period)}`,
  });
}
