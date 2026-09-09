import { eq } from "drizzle-orm";
import { db } from "../index";
import { experienceSurveys } from "../schema";

export async function upsertSurvey(
  submissionId: number,
  answers: { common: string[]; boardSpecific: string[] }
) {
  const existing = await db.query.experienceSurveys.findFirst({
    where: eq(experienceSurveys.submissionId, submissionId),
  });
  if (existing) {
    const [row] = await db
      .update(experienceSurveys)
      .set({ answers })
      .where(eq(experienceSurveys.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await db.insert(experienceSurveys).values({ submissionId, answers }).returning();
  return row;
}

export async function getSurvey(submissionId: number) {
  return db.query.experienceSurveys.findFirst({
    where: eq(experienceSurveys.submissionId, submissionId),
  });
}
