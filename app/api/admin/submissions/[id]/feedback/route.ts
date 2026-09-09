import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { setProductFeedback } from "@/lib/db/queries/scores";
import { setPhase } from "@/lib/db/queries/submissions";

const schema = z.object({
  feedback: z.string().min(3, "Cần ghi rõ điểm cần chỉnh sửa"),
  status: z.enum(["needs_fix", "approved"]),
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
  const row = await setProductFeedback(Number(id), parsed.data.feedback, parsed.data.status);
  if (parsed.data.status === "approved") {
    await setPhase(Number(id), 3);
  }
  return NextResponse.json({ productScore: row });
}
