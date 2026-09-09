import { and, eq, desc, inArray, isNotNull } from "drizzle-orm";
import { db } from "../index";
import { ideaScores, productScores, submissions } from "../schema";

type Modules = Record<string, number>;

export async function addIdeaScore(
  submissionId: number,
  moduleScores: Modules,
  summary: string | undefined,
  source: "external_ai" | "judge" = "external_ai",
  judgeId?: number
) {
  const [row] = await db
    .insert(ideaScores)
    .values({ submissionId, moduleScores, summary, source, judgeId })
    .returning();
  return row;
}

export async function addProductScore(
  submissionId: number,
  moduleScores: Modules,
  summary: string | undefined,
  source: "external_ai" | "judge" = "external_ai",
  judgeId?: number
) {
  const [row] = await db
    .insert(productScores)
    .values({ submissionId, moduleScores, summary, source, judgeId })
    .returning();
  return row;
}

/** Điểm gần nhất — dùng để HIỂN THỊ nhanh, không phải để chốt điểm cuối. */
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

/** Một giám khảo chấm lại thì GHI ĐÈ phiếu cũ của chính họ, không cộng thêm phiếu. */
export async function findJudgeIdeaScore(submissionId: number, judgeId: number) {
  return db.query.ideaScores.findFirst({
    where: and(eq(ideaScores.submissionId, submissionId), eq(ideaScores.judgeId, judgeId)),
  });
}

export async function findJudgeProductScore(submissionId: number, judgeId: number) {
  return db.query.productScores.findFirst({
    where: and(eq(productScores.submissionId, submissionId), eq(productScores.judgeId, judgeId)),
  });
}

export async function updateIdeaScore(id: number, moduleScores: Modules, summary?: string) {
  const [row] = await db
    .update(ideaScores)
    .set({ moduleScores, summary })
    .where(eq(ideaScores.id, id))
    .returning();
  return row;
}

export async function updateProductScore(id: number, moduleScores: Modules, summary?: string) {
  const [row] = await db
    .update(productScores)
    .set({ moduleScores, summary })
    .where(eq(productScores.id, id))
    .returning();
  return row;
}

/** Phản hồi Phase 2 — thuộc về BÀI, không thuộc phiếu của giám khảo nào. */
export async function setProductFeedback(
  submissionId: number,
  feedback: string,
  status: "needs_fix" | "approved"
) {
  const latest = await getLatestProductScore(submissionId);
  if (!latest) throw new Error("Chưa có điểm Phase 2 để phản hồi");
  const [row] = await db
    .update(submissions)
    .set({
      btcFeedback: feedback,
      feedbackStatus: status,
      kpi3pFlag: status === "approved",
      updatedAt: new Date(),
    })
    .where(eq(submissions.id, submissionId))
    .returning();
  return row;
}

/**
 * Điểm CHỐT của một module.
 *
 * Thể lệ: nhiều giám khảo chấm ĐỘC LẬP, điểm cuối là TRUNG BÌNH. Trước đây code lấy
 * `getLatestProductScore` — ba giám khảo chấm thì chỉ phiếu cuối cùng được tính, hai phiếu kia
 * biến mất không dấu vết.
 *
 * Quy tắc: CÓ phiếu giám khảo thì lấy trung bình các phiếu đó (người thắng máy — thể lệ nói hội
 * đồng xác nhận trước khi công bố). KHÔNG có phiếu nào thì mới dùng điểm hệ chấm ngoài.
 */
function aggregateModule(
  rows: { moduleScores: Modules; source: string; judgeId: number | null }[],
  key: string
): { value: number; basis: "judges" | "external_ai" | "none"; judgeCount: number } {
  const judged = rows.filter((r) => r.source === "judge" && r.judgeId != null);
  if (judged.length > 0) {
    const sum = judged.reduce((acc, r) => acc + Number(r.moduleScores[key] ?? 0), 0);
    return {
      value: Math.round((sum / judged.length) * 10) / 10,
      basis: "judges",
      judgeCount: judged.length,
    };
  }
  const external = rows.filter((r) => r.source === "external_ai");
  if (external.length > 0) {
    // Hệ ngoài có thể đẩy lại nhiều lần — lấy bản mới nhất (rows đã sắp giảm dần theo thời gian).
    return { value: Number(external[0].moduleScores[key] ?? 0), basis: "external_ai", judgeCount: 0 };
  }
  return { value: 0, basis: "none", judgeCount: 0 };
}

export type AggregatedScores = {
  giaTriUngDung: ReturnType<typeof aggregateModule>;
  chatLuongKyThuat: ReturnType<typeof aggregateModule>;
  hoanThien: ReturnType<typeof aggregateModule>;
  hasIdeaScore: boolean;
  hasProductScore: boolean;
};

export async function getAggregatedScores(submissionId: number): Promise<AggregatedScores> {
  const [ideas, products] = await Promise.all([
    db.query.ideaScores.findMany({
      where: eq(ideaScores.submissionId, submissionId),
      orderBy: desc(ideaScores.createdAt),
    }),
    db.query.productScores.findMany({
      where: eq(productScores.submissionId, submissionId),
      orderBy: desc(productScores.createdAt),
    }),
  ]);

  return {
    giaTriUngDung: aggregateModule(ideas, "giaTriUngDung"),
    chatLuongKyThuat: aggregateModule(products, "chatLuongKyThuat"),
    hoanThien: aggregateModule(products, "hoanThien"),
    hasIdeaScore: ideas.length > 0,
    hasProductScore: products.length > 0,
  };
}

export type SubmissionScoreOverview = AggregatedScores & {
  /** Tên các giám khảo đã bỏ phiếu — BTC cần thấy ai chấm rồi, ai chưa. */
  judgeNames: string[];
  /** Phiếu của CHÍNH người đang xem, để họ sửa lại đúng phiếu mình. */
  myIdea: Record<string, number> | null;
  myProduct: Record<string, number> | null;
};

/**
 * Tổng hợp điểm cho NHIỀU bài trong 2 truy vấn.
 *
 * Màn /admin/scoring trước đây gọi `getLatestIdeaScore` + `getLatestProductScore` trong vòng lặp
 * (2 truy vấn mỗi bài). Với 35 bài/tuần là 70 lượt đi DB cho một lần mở trang.
 */
export async function getScoreOverviews(
  submissionIds: number[],
  viewerId: number
): Promise<Map<number, SubmissionScoreOverview>> {
  const out = new Map<number, SubmissionScoreOverview>();
  if (submissionIds.length === 0) return out;

  const [ideas, products] = await Promise.all([
    db.query.ideaScores.findMany({
      where: inArray(ideaScores.submissionId, submissionIds),
      orderBy: desc(ideaScores.createdAt),
      with: { judge: { columns: { id: true, name: true, email: true } } },
    }),
    db.query.productScores.findMany({
      where: inArray(productScores.submissionId, submissionIds),
      orderBy: desc(productScores.createdAt),
      with: { judge: { columns: { id: true, name: true, email: true } } },
    }),
  ]);

  for (const id of submissionIds) {
    const i = ideas.filter((r) => r.submissionId === id);
    const p = products.filter((r) => r.submissionId === id);
    const names = new Set<string>();
    for (const r of [...i, ...p]) {
      if (r.judge) names.add(r.judge.name ?? r.judge.email);
    }
    out.set(id, {
      giaTriUngDung: aggregateModule(i, "giaTriUngDung"),
      chatLuongKyThuat: aggregateModule(p, "chatLuongKyThuat"),
      hoanThien: aggregateModule(p, "hoanThien"),
      hasIdeaScore: i.length > 0,
      hasProductScore: p.length > 0,
      judgeNames: [...names],
      myIdea: i.find((r) => r.judgeId === viewerId)?.moduleScores ?? null,
      myProduct: p.find((r) => r.judgeId === viewerId)?.moduleScores ?? null,
    });
  }
  return out;
}

/** Danh sách phiếu chấm tay của một bài — để BTC thấy ai đã chấm, ai chưa. */
export async function listJudgeScores(submissionId: number) {
  const [ideas, products] = await Promise.all([
    db.query.ideaScores.findMany({
      where: and(eq(ideaScores.submissionId, submissionId), isNotNull(ideaScores.judgeId)),
      with: { judge: true },
    }),
    db.query.productScores.findMany({
      where: and(eq(productScores.submissionId, submissionId), isNotNull(productScores.judgeId)),
      with: { judge: true },
    }),
  ]);
  return { ideas, products };
}
