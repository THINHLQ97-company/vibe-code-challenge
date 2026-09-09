import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { addIdeaScore, addProductScore } from "@/lib/db/queries/scores";

// Fallback cho BTC/BGK tự nhập điểm khi CHƯA có hệ chấm điểm ngoài kết nối
// (xem docs/PRD.md mục 7 — integration point chưa chốt hợp đồng API chính thức).
// Điểm nhập ở đây đánh dấu source="judge" để phân biệt với điểm đẩy tự động.
const schema = z.object({
  phase: z.union([z.literal(1), z.literal(2)]),
  moduleScores: z.record(z.string(), z.number()),
  summary: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  const { id } = await params;

  if (parsed.data.phase === 1) {
    const row = await addIdeaScore(Number(id), parsed.data.moduleScores, parsed.data.summary, "judge");
    return NextResponse.json({ ideaScore: row });
  }
  const row = await addProductScore(Number(id), parsed.data.moduleScores, parsed.data.summary, "judge");
  return NextResponse.json({ productScore: row });
}
