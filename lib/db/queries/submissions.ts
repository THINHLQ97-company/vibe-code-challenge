import { eq, desc, and, gte, lte, lt, isNotNull } from "drizzle-orm";
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
export function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Thứ 2
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}
export function endOfWeek(date: Date) {
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

/**
 * Gắn/gỡ cờ "dùng repo có sẵn". Gắn cờ thì hạ luôn `feedbackStatus` về `needs_fix` — bài không thể
 * đang ở trạng thái "đã duyệt đạt Phase 2" mà lại vi phạm điều kiện để qua Phase 2.
 */
export async function setPrebuiltFlag(id: number, prebuilt: boolean, note?: string) {
  const [row] = await db
    .update(submissions)
    .set({
      isPrebuiltRepo: prebuilt,
      prebuiltNote: prebuilt ? (note ?? null) : null,
      ...(prebuilt ? { feedbackStatus: "needs_fix" as const, kpi3pFlag: false } : {}),
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

/**
 * Mở lại một bài ĐÃ công bố để chấm lại — chỉ dùng khi BTC CHẤP NHẬN phản biện.
 *
 * Thiếu hàm này thì nút "Chấp nhận & chấm lại" là ngõ cụt: phản biện được ghi nhận nhưng điểm cũ
 * vẫn nguyên, và cổng chặn công bố lại ("Bài này đã công bố kết quả") khoá luôn đường sửa. Xoá
 * `publishedAt`/`finalScore` để hội đồng chấm lại rồi công bố lại — thí sinh thấy bảng điểm quay
 * về trạng thái đang đối chiếu, đúng với việc điểm cũ đã bị bác.
 */
export async function reopenForRescore(id: number) {
  const [row] = await db
    .update(submissions)
    .set({ finalScore: null, publishedAt: null, updatedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning();
  return row;
}

/**
 * Bảng điểm của ĐỢT ĐANG THI CÙNG TUẦN, không phải xếp hạng toàn mùa.
 *
 * Thể lệ duyệt cuốn chiếu 30–40 bài/tuần, nên "đối thủ" thật sự của một người là những người được
 * duyệt đề tài cùng tuần với họ — cùng hạn nộp, cùng khung đăng bài, cùng kỳ đếm tương tác. Xếp
 * chung cả mùa là so người vừa đăng ký với người đã xong từ tháng trước.
 *
 * Trả về CẢ bài chưa công bố (điểm `null`) để thấy đủ mặt đợt, nhưng chỉ bài đã công bố mới có
 * điểm. Sắp theo điểm giảm dần, bài chưa có điểm xuống cuối.
 */
export async function listCohortByBoard(
  board: "ky_thuat" | "van_phong",
  weekStart: Date,
  weekEnd: Date
) {
  const rows = await db
    .select({
      id: submissions.id,
      productName: submissions.productName,
      finalScore: submissions.finalScore,
      publishedAt: submissions.publishedAt,
      userId: submissions.userId,
      userName: users.name,
      department: users.department,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .where(
      and(
        eq(users.board, board),
        isNotNull(submissions.approvedAt),
        gte(submissions.approvedAt, weekStart),
        lt(submissions.approvedAt, weekEnd)
      )
    )
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
