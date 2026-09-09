import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listAppealsWithSubmission } from "@/lib/db/queries/appeals";

export async function GET() {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;
  const appeals = await listAppealsWithSubmission();
  return NextResponse.json({ appeals });
}
