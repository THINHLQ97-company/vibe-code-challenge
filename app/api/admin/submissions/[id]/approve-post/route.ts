import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { approveFacebookPost } from "@/lib/db/queries/submissions";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const row = await approveFacebookPost(Number(id));
  return NextResponse.json({ submission: row });
}
