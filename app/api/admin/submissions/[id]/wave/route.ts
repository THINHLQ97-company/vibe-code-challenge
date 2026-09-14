import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { getSubmissionById } from "@/lib/db/queries/submissions";
import { getWave, countInWave, moveSubmissionToWave } from "@/lib/db/queries/waves";

export const dynamic = "force-dynamic";

const schema = z.object({ waveId: z.number().int().nullable() });

/** BTC chuyển một thí sinh sang đợt thi khác. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const id = Number((await params).id);
  const submission = await getSubmissionById(id);
  if (!submission) return NextResponse.json({ error: "Không tìm thấy bài" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const { waveId } = parsed.data;

  if (waveId != null) {
    const wave = await getWave(waveId);
    if (!wave) return NextResponse.json({ error: "Đợt thi không tồn tại" }, { status: 404 });
    /**
     * CẢNH BÁO chứ không CHẶN khi đợt đích đã đầy: đây là thao tác của BTC để xử lý tình huống
     * (dồn người, cân lại đợt), và chặn cứng sẽ khiến họ không cứu được ca cần cứu. Trả về số đã
     * đăng ký để giao diện nói rõ đợt đang vượt trần.
     */
    const n = await countInWave(waveId);
    const row = await moveSubmissionToWave(id, waveId);
    return NextResponse.json({
      submission: row,
      waveFull: n >= wave.capacity,
      registered: n + 1,
      capacity: wave.capacity,
    });
  }

  const row = await moveSubmissionToWave(id, null);
  return NextResponse.json({ submission: row });
}
