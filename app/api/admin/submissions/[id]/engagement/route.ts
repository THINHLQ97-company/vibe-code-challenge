import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/api-auth";
import { setEngagement, getEngagementCohort } from "@/lib/db/queries/submissions";
import { engagementTierFromCount } from "@/lib/scoring";

const schema = z.object({ count: z.number().int().min(0) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSession(["admin", "judge"]);
  if ("error" in auth) return auth.error;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const { id } = await params;
  const cohort = await getEngagementCohort(Number(id));
  const tier = engagementTierFromCount(parsed.data.count, cohort);
  const row = await setEngagement(Number(id), parsed.data.count, tier);
  return NextResponse.json({ submission: row, tier });
}
