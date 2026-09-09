import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { rejectSubmission } from "@/lib/db/queries/submissions";

const schema = z.object({ note: z.string().min(3, "Cần ghi rõ lý do trả về") });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id } = await params;
  const row = await rejectSubmission(Number(id), parsed.data.note);
  return NextResponse.json({ submission: row });
}
