import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { reassignBallotToAdmin } from "@/lib/db/queries/scores";

export const dynamic = "force-dynamic";

const schema = z.object({
  phase: z.union([z.literal(1), z.literal(2)]),
  moduleScores: z.record(z.string(), z.number().min(0).max(100)),
  summary: z.string().max(2000).optional(),
});

/**
 * ADMIN sửa phiếu của một giám khảo khác.
 *
 * Phiếu ĐỔI CHỦ sang admin sau khi sửa (BTC chốt 15/09/2026): để nguyên tên giám khảo cũ trên một
 * phiếu đã bị người khác sửa nghĩa là gán cho họ một con số họ không đưa ra.
 *
 * Tách khỏi `manual-score` vì hai việc khác nhau: `manual-score` là "tôi chấm bài này", còn đây là
 * "tôi sửa phiếu của người khác". Gộp chung thì một tham số sai sẽ biến việc này thành việc kia.
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const ballotId = Number((await params).id);
  if (!Number.isInteger(ballotId)) {
    return NextResponse.json({ error: "Mã phiếu không hợp lệ" }, { status: 400 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const row = await reassignBallotToAdmin(
    parsed.data.phase,
    ballotId,
    auth.session.userId,
    parsed.data.moduleScores,
    parsed.data.summary
  );
  if (!row) return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
  return NextResponse.json({ ballot: row });
}
