import { getSubmissionById, publishSubmission } from "@/lib/db/queries/submissions";
import { getAggregatedScores } from "@/lib/db/queries/scores";
import { missingCheckpoints } from "@/lib/checkpoints";
import { computeFinalScore } from "@/lib/scoring";
import { getWave } from "@/lib/db/queries/waves";

export type PublishResult =
  | { id: number; ok: true; finalScore: number }
  | { id: number; ok: false; error: string };

/**
 * Công bố điểm cho MỘT bài, dùng chung cho cả nút công bố lẻ lẫn công bố hàng loạt.
 *
 * Tách ra khỏi route để hai đường không bao giờ áp hai bộ điều kiện khác nhau — công bố hàng loạt
 * mà lỏng hơn công bố lẻ là cách đưa ra ngoài những bài chưa đủ điều kiện, và không ai phát hiện
 * vì nó xảy ra giữa một lô mấy chục bài.
 *
 * KHÔNG đòi phiếu giám khảo: thể lệ cho phép công bố khi mới có điểm máy, giám khảo chỉ để điều
 * chỉnh (BTC chốt 15/09/2026).
 */
export async function publishOne(id: number): Promise<PublishResult> {
  const submission = await getSubmissionById(id);
  if (!submission) return { id, ok: false, error: "Không tìm thấy bài dự thi" };
  if (submission.publishedAt) return { id, ok: false, error: "Đã công bố trước đó" };
  if (submission.isPrebuiltRepo) {
    return { id, ok: false, error: "Bị gắn cờ dùng repo/mẫu có sẵn" };
  }

  const missing = missingCheckpoints(submission);
  if (missing.length > 0) {
    return { id, ok: false, error: `Chưa đủ mốc bắt buộc: ${missing.join(", ")}` };
  }

  const scores = await getAggregatedScores(id);
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
  return { id, ok: true, finalScore };
}
