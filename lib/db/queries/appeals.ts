import { eq, desc } from "drizzle-orm";
import { db } from "../index";
import { appeals } from "../schema";

export async function createAppeal(submissionId: number, criteria: string, evidenceUrl: string) {
  const [row] = await db
    .insert(appeals)
    .values({ submissionId, criteria, evidenceUrl })
    .returning();
  return row;
}

export async function listAppealsWithSubmission() {
  return db.query.appeals.findMany({
    with: { submission: { with: { user: true } } },
    orderBy: desc(appeals.createdAt),
  });
}

export async function resolveAppeal(
  id: number,
  status: "accepted" | "rejected",
  note: string,
  resolvedBy: number
) {
  const [row] = await db
    .update(appeals)
    .set({ status, resolutionNote: note, resolvedBy, resolvedAt: new Date() })
    .where(eq(appeals.id, id))
    .returning();
  return row;
}

/** Phản biện của một bài — dùng để chặn gửi lần 2 (thể lệ: một vòng duy nhất). */
export async function listAppealsForSubmission(submissionId: number) {
  return db.query.appeals.findMany({
    where: eq(appeals.submissionId, submissionId),
    orderBy: desc(appeals.createdAt),
  });
}
