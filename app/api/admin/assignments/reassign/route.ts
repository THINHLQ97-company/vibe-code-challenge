import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { reassign } from "@/lib/db/queries/assignments";

export const dynamic = "force-dynamic";

const schema = z.object({
  submissionId: z.number().int().positive(),
  fromJudgeId: z.number().int().positive(),
  toJudgeId: z.number().int().positive(),
});

/** Giao lại một bài cho giám khảo khác — dùng khi người được giao vắng mặt. */
export async function POST(req: Request) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const result = await reassign(
    parsed.data.submissionId,
    parsed.data.fromJudgeId,
    parsed.data.toJudgeId,
    auth.session.userId
  );
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
  return NextResponse.json({ ok: true });
}
