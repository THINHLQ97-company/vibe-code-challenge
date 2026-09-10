import type { Submission } from "./db/schema";

/**
 * TỪ VỰNG TRẠNG THÁI DÙNG CHUNG cho cả khu thí sinh và khu BTC.
 *
 * Trước đây mỗi màn tự đặt chữ cho cùng một tình huống: chỗ ghi "Chờ chấm", chỗ "Đang chờ xử lý",
 * chỗ "Chưa rà soát", chỗ khác lại để trống. Người theo dõi không biết hai chữ khác nhau có phải
 * cùng một trạng thái không, và BTC không quét nhanh được ai đang kẹt ở đâu.
 *
 * Ba nhóm, ba màu, dùng nhất quán mọi nơi:
 *   · `done`    (teal)  — đã qua, không cần làm gì nữa
 *   · `waiting` (amber) — đang chờ MỘT BÊN nào đó; câu chữ luôn nói rõ chờ ai
 *   · `blocked` (đỏ)    — bị chặn, phải có người xử lý mới đi tiếp được
 *   · `idle`    (xám)   — chưa tới lượt
 */
export type StageState = "done" | "waiting" | "blocked" | "idle";

export type StageTone = "success" | "warning" | "danger" | "neutral";

export const STAGE_TONE: Record<StageState, StageTone> = {
  done: "success",
  waiting: "warning",
  blocked: "danger",
  idle: "neutral",
};

export type Stage = {
  state: StageState;
  tone: StageTone;
  /** Nhãn ngắn cho huy hiệu — tối đa vài từ. */
  label: string;
  /** Câu đầy đủ: đang chờ AI làm gì. Dùng ở màn chi tiết. */
  detail: string;
};

function stage(state: StageState, label: string, detail: string): Stage {
  return { state, tone: STAGE_TONE[state], label, detail };
}

type S = Pick<
  Submission,
  | "registrationStatus"
  | "currentPhase"
  | "securityStatus"
  | "feedbackStatus"
  | "isPrebuiltRepo"
  | "githubVerifiedAt"
  | "vibehostUrl"
  | "facebookPostUrl"
  | "facebookApprovedAt"
  | "engagementTier"
  | "surveySubmittedAt"
  | "publishedAt"
>;

/**
 * Trạng thái TỔNG của một bài — dùng ở danh sách thí sinh, bảng chấm điểm, dashboard.
 * Thứ tự kiểm chính là thứ tự chặn thực tế: cái nào chặn trước thì báo trước.
 */
export function submissionStage(s: S): Stage {
  if (s.publishedAt) return stage("done", "Đã công bố", "Đã công bố kết quả, xong toàn bộ.");
  if (s.registrationStatus === "returned")
    return stage("blocked", "Trả về sửa", "BTC trả đề tài về — đang chờ THÍ SINH sửa và nộp lại.");
  if (s.registrationStatus === "pending")
    return stage("waiting", "Chờ duyệt đề tài", "Đang chờ BTC duyệt đề tài (CP2).");
  if (s.isPrebuiltRepo)
    return stage("blocked", "Vi phạm repo có sẵn", "Bị gắn cờ dùng repo/mẫu có sẵn — không qua Phase 2.");
  if (s.securityStatus === "flagged")
    return stage("blocked", "Gắn cờ an toàn", "Vướng điều cấm ở cổng an toàn — đang chờ THÍ SINH sửa.");
  if (!s.vibehostUrl) return stage("idle", "Đang làm bài", "Thí sinh đang làm, chưa nộp sản phẩm.");
  if (!s.githubVerifiedAt)
    return stage("blocked", "Chưa xác minh mã nguồn", "Chưa xác minh được quyền truy cập repo (CP3).");
  if (s.securityStatus === "pending")
    return stage("waiting", "Chờ rà soát an toàn", "Đang chờ BTC rà soát cổng an toàn (CP4).");
  if (s.feedbackStatus === "needs_fix")
    return stage("blocked", "Cần chỉnh sửa", "BTC yêu cầu sửa sản phẩm — đang chờ THÍ SINH nộp lại.");
  if (s.feedbackStatus === "pending")
    return stage("waiting", "Chờ chấm Phase 2", "Đang chờ hội đồng chấm sản phẩm và phản hồi.");
  if (!s.facebookPostUrl)
    return stage("idle", "Chờ đăng bài", "Đã qua Phase 2 — đang chờ THÍ SINH đăng bài lan tỏa.");
  if (!s.facebookApprovedAt)
    return stage("waiting", "Chờ duyệt bài đăng", "Đang chờ BGK duyệt bài đăng (CP5).");
  if (s.engagementTier == null)
    return stage("waiting", "Đang đếm tương tác", "Đang trong cửa sổ đếm tương tác 7 ngày.");
  if (!s.surveySubmittedAt)
    return stage("blocked", "Thiếu phiếu trải nghiệm", "Đang chờ THÍ SINH nộp phiếu trải nghiệm (CP6).");
  return stage("waiting", "Chờ công bố", "Đã đủ mốc — đang chờ BTC chốt điểm và công bố.");
}

/** Trạng thái một CỔNG đơn lẻ, dùng cho huy hiệu ở màn chuyên trách. */
export function gateStage(
  value: "pending" | "clean" | "flagged" | "approved" | "needs_fix",
  kind: "security" | "feedback"
): Stage {
  if (kind === "security") {
    if (value === "clean") return stage("done", "Đã qua cổng", "Không vướng điều cấm nào.");
    if (value === "flagged") return stage("blocked", "Bị gắn cờ", "Vướng điều cấm — chờ thí sinh sửa.");
    return stage("waiting", "Chờ rà soát", "Đang chờ BTC rà soát.");
  }
  if (value === "approved") return stage("done", "Đạt Phase 2", "BTC đã duyệt đạt.");
  if (value === "needs_fix") return stage("blocked", "Cần sửa", "BTC yêu cầu chỉnh sửa.");
  return stage("waiting", "Chờ chấm", "Đang chờ hội đồng chấm.");
}
