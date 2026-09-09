import { NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listSubmissionsWithUser } from "@/lib/db/queries/submissions";

export async function GET() {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;
  const submissions = await listSubmissionsWithUser();
  return NextResponse.json({ submissions });
}
