import { eq, desc } from "drizzle-orm";
import { db } from "../index";
import { ideaScores, productScores } from "../schema";

export async function addIdeaScore(
  submissionId: number,
  moduleScores: Record<string, number>,
  summary: string | undefined,
  source: "external_ai" | "judge" = "external_ai"
) {
  const [row] = await db
    .insert(ideaScores)
    .values({ submissionId, moduleScores, summary, source })
    .returning();
  return row;
}

export async function addProductScore(
  submissionId: number,
  moduleScores: Record<string, number>,
  summary: string | undefined,
  source: "external_ai" | "judge" = "external_ai"
) {
  const [row] = await db
    .insert(productScores)
    .values({ submissionId, moduleScores, summary, source })
    .returning();
  return row;
}

export async function getLatestIdeaScore(submissionId: number) {
  return db.query.ideaScores.findFirst({
    where: eq(ideaScores.submissionId, submissionId),
    orderBy: desc(ideaScores.createdAt),
  });
}

export async function getLatestProductScore(submissionId: number) {
  return db.query.productScores.findFirst({
    where: eq(productScores.submissionId, submissionId),
    orderBy: desc(productScores.createdAt),
  });
}

export async function setProductFeedback(
  submissionId: number,
  feedback: string,
  status: "needs_fix" | "approved"
) {
  const latest = await getLatestProductScore(submissionId);
  if (!latest) throw new Error("Chưa có điểm Phase 2 để phản hồi");
  const [row] = await db
    .update(productScores)
    .set({
      btcFeedback: feedback,
      feedbackStatus: status,
      kpi3pFlag: status === "approved",
    })
    .where(eq(productScores.id, latest.id))
    .returning();
  return row;
}
