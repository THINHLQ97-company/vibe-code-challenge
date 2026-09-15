import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { buildAssignmentDraft, saveAssignments } from "@/lib/db/queries/assignments";

export const dynamic = "force-dynamic";

const previewSchema = z.object({ waveId: z.number().int().positive() });

/** Xem trước: tính bản nháp, KHÔNG ghi gì. */
export async function PUT(req: Request) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = previewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thiếu mã đợt thi" }, { status: 400 });

  return NextResponse.json(await buildAssignmentDraft(parsed.data.waveId));
}

const saveSchema = z.object({
  waveId: z.number().int().positive(),
  draft: z
    .array(
      z.object({
        submissionId: z.number().int().positive(),
        judgeIds: z.array(z.number().int().positive()).min(1).max(5),
      })
    )
    .max(500),
});

/**
 * Chốt: ghi ĐÚNG bản nháp admin vừa xem.
 *
 * Nhận lại bản nháp thay vì tự chia lại lần nữa. Chia lại sẽ ra kết quả khác vì thuật toán có yếu
 * tố ngẫu nhiên, và lúc đó thứ được lưu không phải thứ admin vừa duyệt — đúng kiểu sai lệch không
 * ai phát hiện ra cho tới khi có người thắc mắc vì sao mình chấm bài này.
 */
export async function POST(req: Request) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = saveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const { saved } = await saveAssignments(
    parsed.data.waveId,
    parsed.data.draft,
    auth.session.userId
  );
  return NextResponse.json({ saved });
}
