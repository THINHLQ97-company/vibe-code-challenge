import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getSubmissionById, publishSubmission } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { missingCheckpoints } from "@/lib/checkpoints";
import { computeFinalScore } from "@/lib/scoring";
import { getWave } from "@/lib/db/queries/waves";

export type PublishTarget = 1 | 2 | "final";

export type PublishResult =
  | { id: number; ok: true; finalScore?: number }
  | { id: number; ok: false; error: string };

export const PUBLISH_LABEL: Record<string, string> = {
  "1": "điểm Ý tưởng",
  "2": "điểm Sản phẩm",
  final: "kết quả cuối",
};

/**
 * Gửi điểm cho thí sinh — BA hành động riêng, ba bộ điều kiện riêng.
 *
 * Vì sao không dùng một nút chung: nút chung phải tính tổng điểm từ cả ba phase, nên nới điều kiện
 * để chạy khi thiếu Phase 2 nghĩa là ra một tổng điểm tính trên dữ liệu chưa đủ, hiện cho thí sinh
 * như điểm chính thức, và mở luôn cửa phản biện 48 giờ cho một con số sẽ còn đổi.
 *
 * Cách ban tổ chức vận hành: gửi điểm một lượt vào chiều thứ Bảy. Ai mới xong phần ý tưởng thì
 * nhận điểm phần đó; phần sản phẩm hiện "Chưa thực hiện" chứ không phải 0.
 */
export async function publish(id: number, target: PublishTarget): Promise<PublishResult> {
  const submission = await getSubmissionById(id);
  if (!submission) return { id, ok: false, error: "Không tìm thấy bài dự thi" };
  if (submission.isPrebuiltRepo) {
    return { id, ok: false, error: "Bị gắn cờ dùng repo/mẫu có sẵn" };
  }
  const scores = await getAggregatedScores(id);

  if (target === 1) {
    if (submission.phase1PublishedAt) return { id, ok: false, error: "Đã gửi điểm Ý tưởng" };
    if (!scores.hasIdeaScore) return { id, ok: false, error: "Chưa có điểm Phase 1" };
    await db
      .update(submissions)
      .set({ phase1PublishedAt: new Date(), updatedAt: new Date() })
      .where(eq(submissions.id, id));
    return { id, ok: true };
  }

  if (target === 2) {
    if (submission.phase2PublishedAt) return { id, ok: false, error: "Đã gửi điểm Sản phẩm" };
    if (!scores.hasProductScore) return { id, ok: false, error: "Chưa có điểm Phase 2" };
    /**
     * Bắt buộc qua cổng an toàn (BTC chốt 15/09/2026). Báo "bạn được 48/55 điểm kỹ thuật" trong
     * khi bài đang bị gắn cờ vi phạm là gửi tín hiệu sai — thí sinh tưởng mình đã qua.
     */
    if (submission.securityStatus !== "clean") {
      return { id, ok: false, error: "Chưa qua cổng rà soát an toàn (CP4)" };
    }
    await db
      .update(submissions)
      .set({ phase2PublishedAt: new Date(), updatedAt: new Date() })
      .where(eq(submissions.id, id));
    return { id, ok: true };
  }

  // ── Kết quả cuối: giữ nguyên bộ điều kiện chặt như trước ──────────────────────────────
  if (submission.publishedAt) return { id, ok: false, error: "Đã công bố kết quả cuối" };

  const missing = missingCheckpoints(submission);
  if (missing.length > 0) {
    return { id, ok: false, error: `Chưa đủ mốc bắt buộc: ${missing.join(", ")}` };
  }
  if (!scores.hasIdeaScore || !scores.hasProductScore) {
    return { id, ok: false, error: "Chưa đủ điểm Phase 1/2" };
  }

  const wave = submission.waveId != null ? await getWave(submission.waveId) : null;
  const finalScore = computeFinalScore({
    technicalRaw: scores.chatLuongKyThuat.value,
    completion: scores.hoanThien.value,
    applicationValue: scores.giaTriUngDung.value,
    engagementTier: submission.engagementTier,
    waveBonus: wave?.bonusPoints ?? 0,
  });

  await publishSubmission(id, finalScore);
  // Công bố kết quả cuối thì hiển nhiên hai phase cũng đã gửi — lấp luôn cho bài nào chưa.
  await db
    .update(submissions)
    .set({
      phase1PublishedAt: submission.phase1PublishedAt ?? new Date(),
      phase2PublishedAt: submission.phase2PublishedAt ?? new Date(),
    })
    .where(eq(submissions.id, id));

  return { id, ok: true, finalScore };
}

/**
 * GỠ điểm đã gửi.
 *
 * Cần có vì sai sót là chuyện sẽ xảy ra — giám khảo chấm nhầm, ban tổ chức bấm nhầm bài. Không có
 * đường lùi thì người ta ngại bấm gửi sớm, đúng thứ cơ chế gửi-theo-phase sinh ra để khuyến khích.
 *
 * Gỡ kết quả cuối thì xoá luôn điểm tổng và mốc công bố, để cửa phản biện đóng lại theo — giữ tổng
 * điểm cũ mà nói "chưa công bố" là hai chỗ nói trái nhau.
 */
export async function unpublish(id: number, target: PublishTarget): Promise<PublishResult> {
  const submission = await getSubmissionById(id);
  if (!submission) return { id, ok: false, error: "Không tìm thấy bài dự thi" };

  if (target === "final") {
    if (!submission.publishedAt) return { id, ok: false, error: "Chưa công bố kết quả cuối" };
    await db
      .update(submissions)
      .set({ publishedAt: null, finalScore: null, updatedAt: new Date() })
      .where(eq(submissions.id, id));
    return { id, ok: true };
  }

  const col = target === 1 ? "phase1PublishedAt" : "phase2PublishedAt";
  if (!submission[col]) return { id, ok: false, error: "Chưa gửi điểm phase này" };
  /**
   * Không gỡ được điểm phase khi kết quả cuối đã công bố: tổng điểm đang hiện ra được tính từ
   * chính phase đó, gỡ một nửa sẽ tạo ra bảng điểm tự mâu thuẫn. Phải gỡ kết quả cuối trước.
   */
  if (submission.publishedAt) {
    return { id, ok: false, error: "Gỡ kết quả cuối trước rồi mới gỡ được điểm từng phase" };
  }
  await db
    .update(submissions)
    .set({ [col]: null, updatedAt: new Date() })
    .where(eq(submissions.id, id));
  return { id, ok: true };
}
