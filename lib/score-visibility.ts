/**
 * Thí sinh được thấy điểm khi nào.
 *
 * LUẬT (BTC chốt 15/09/2026): điểm CHỈ hiện sau khi ban tổ chức bấm gửi điểm cho phase đó. Giám
 * khảo chấm xong KHÔNG làm điểm hiện ra.
 *
 * Trước đây điểm hiện ngay khi có phiếu giám khảo — nghĩa là thể lệ ghi "chỉ ban tổ chức gửi điểm"
 * nhưng hệ thống làm ngược lại, và ban tổ chức không có cách nào giữ điểm để gửi một lượt vào
 * chiều thứ Bảy như cách họ vận hành.
 *
 * Bốn trạng thái, vì gộp lại thì thí sinh không phân biệt được "tôi chưa làm" với "tôi làm rồi mà
 * chưa ai chấm" — hai tình huống đòi hai hành động hoàn toàn khác nhau từ phía họ.
 */
export type ScoreBasis = "judges" | "external_ai" | "none";

export type CandidateScoreView =
  | { visible: true; value: number; judgeCount: number }
  | { visible: false; label: string; hint: string };

export function candidateScoreView(input: {
  agg: { value: number; basis: ScoreBasis; judgeCount: number } | undefined;
  /** Thí sinh đã nộp thứ cần để chấm phase này chưa. */
  submitted: boolean;
  /** Mốc ban tổ chức gửi điểm phase này. `null` = chưa gửi. */
  publishedAt: Date | null;
  /** Câu mô tả việc thí sinh cần làm, dùng khi họ chưa nộp. */
  notSubmittedHint: string;
}): CandidateScoreView {
  if (!input.submitted) {
    return { visible: false, label: "Chưa thực hiện", hint: input.notSubmittedHint };
  }

  // Đã gửi điểm thì hiện con số, kể cả khi mới có điểm máy — quyền quyết định nằm ở ban tổ chức.
  if (input.publishedAt && input.agg && input.agg.basis !== "none") {
    return { visible: true, value: input.agg.value, judgeCount: input.agg.judgeCount };
  }

  if (!input.agg || input.agg.basis === "none") {
    return {
      visible: false,
      label: "Chờ chấm",
      hint: "Bài của bạn đã nộp và đang xếp hàng chờ hội đồng chấm.",
    };
  }

  // Đã chấm nhưng chưa tới lượt gửi. Cố ý KHÔNG nói đã có điểm rồi — nói ra thì người ta hỏi ngay
  // "vậy bao nhiêu", và câu trả lời duy nhất là "chưa cho biết", nghe còn khó chịu hơn.
  return {
    visible: false,
    label: "Chờ công bố",
    hint: "Hội đồng đang hoàn tất. Ban tổ chức công bố điểm theo đợt vào cuối tuần.",
  };
}
