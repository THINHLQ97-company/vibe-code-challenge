import { eq, desc, and, gte, lte, isNotNull } from "drizzle-orm";
import { db } from "../index";
import { submissions, users, type NewSubmission } from "../schema";

export async function getCurrentSubmissionForUser(userId: number) {
  return db.query.submissions.findFirst({
    where: eq(submissions.userId, userId),
    orderBy: desc(submissions.createdAt),
  });
}

export async function getSubmissionById(id: number) {
  return db.query.submissions.findFirst({ where: eq(submissions.id, id) });
}

export async function getSubmissionWithUser(id: number) {
  return db.query.submissions.findFirst({
    where: eq(submissions.id, id),
    with: { user: true, ideaScores: true, productScores: true },
  });
}

export async function listSubmissionsWithUser() {
  return db.query.submissions.findMany({
    with: { user: true },
    orderBy: desc(submissions.createdAt),
  });
}

export async function listPendingApprovals() {
  return db.query.submissions.findMany({
    where: eq(submissions.registrationStatus, "pending"),
    with: { user: true },
    orderBy: submissions.createdAt,
  });
}

export async function createSubmission(data: NewSubmission) {
  const [row] = await db.insert(submissions).values(data).returning();
  return row;
}

// Tuần dương lịch Thứ 2 → Chủ nhật — giả định nêu trong docs/PLAN.md, cần BTC xác nhận.
function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Thứ 2
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return end;
}

export async function countApprovedThisWeek(seasonId: number, at: Date = new Date()) {
  const from = startOfWeek(at);
  const to = endOfWeek(at);
  const rows = await db.query.submissions.findMany({
    where: and(
      eq(submissions.seasonId, seasonId),
      isNotNull(submissions.approvedAt),
      gte(submissions.approvedAt, from),
      lte(submissions.approvedAt, to)
    ),
  });
  return rows.length;
}

export async function approveSubmission(id: number) {
  const submission = await getSubmissionById(id);
  if (!submission) throw new Error("Không tìm thấy bài đăng ký");
  const approvedAt = new Date();
  const deadline = new Date(approvedAt);
  deadline.setDate(deadline.getDate() + submission.requestedDeadlineDays);

  const [row] = await db
    .update(submissions)
    .set({
      registrationStatus: "approved",
      approvedAt,
      submissionDeadline: deadline,
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function rejectSubmission(id: number, note: string) {
  const [row] = await db
    .update(submissions)
    .set({ registrationStatus: "returned", registrationNote: note, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function updatePhase2Info(
  id: number,
  data: { vibehostUrl: string; githubRepoUrl: string }
) {
  const [row] = await db
    .update(submissions)
    .set({ ...data, githubVerifiedAt: null, githubVerifyError: null, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function markGithubVerified(id: number) {
  const [row] = await db
    .update(submissions)
    .set({
      githubVerifiedAt: new Date(),
      githubVerifyError: null,
      githubLastCheckedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function markGithubVerifyFailed(id: number, reason: string) {
  const [row] = await db
    .update(submissions)
    .set({ githubVerifyError: reason, githubLastCheckedAt: new Date(), updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function setSecurityStatus(id: number, status: "clean" | "flagged", note?: string) {
  const [row] = await db
    .update(submissions)
    .set({ securityStatus: status, securityNote: note, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function setPhase(id: number, phase: number) {
  const [row] = await db
    .update(submissions)
    .set({ currentPhase: phase, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function submitFacebookPost(id: number, url: string) {
  const [row] = await db
    .update(submissions)
    .set({ facebookPostUrl: url, facebookApprovedAt: null, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function approveFacebookPost(id: number) {
  const [row] = await db
    .update(submissions)
    .set({ facebookApprovedAt: new Date(), updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function setEngagement(id: number, count: number, tier: number) {
  const [row] = await db
    .update(submissions)
    .set({ engagementCount: count, engagementTier: tier, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function markSurveySubmitted(id: number) {
  const [row] = await db
    .update(submissions)
    .set({ surveySubmittedAt: new Date(), updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function publishSubmission(id: number, finalScore: number) {
  const [row] = await db
    .update(submissions)
    .set({ finalScore, publishedAt: new Date(), currentPhase: 4, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

export async function listPublishedByBoard(board: "ky_thuat" | "van_phong") {
  const rows = await db
    .select({
      id: submissions.id,
      productName: submissions.productName,
      finalScore: submissions.finalScore,
      userName: users.name,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(and(eq(users.board, board), isNotNull(submissions.publishedAt)))
    .orderBy(desc(submissions.finalScore));
  return rows;
}

// Đếm tương tác cùng khung giờ/tuần để tính trung vị điểm lan tỏa (thể lệ mục F) —
// MVP dùng cùng tuần duyệt bài đăng (facebookApprovedAt) làm "cohort", chưa tách khung giờ cụ thể.
export async function getEngagementCohort(submissionId: number) {
  const target = await getSubmissionById(submissionId);
  if (!target?.facebookApprovedAt) return [];
  const from = startOfWeek(target.facebookApprovedAt);
  const to = endOfWeek(target.facebookApprovedAt);
  const rows = await db.query.submissions.findMany({
    where: and(
      isNotNull(submissions.facebookApprovedAt),
      isNotNull(submissions.engagementCount),
      gte(submissions.facebookApprovedAt, from),
      lte(submissions.facebookApprovedAt, to)
    ),
  });
  return rows.map((r) => r.engagementCount!).filter((n) => n != null);
}
