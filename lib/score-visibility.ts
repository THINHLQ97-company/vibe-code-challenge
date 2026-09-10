/**
 * Thí sinh được thấy điểm khi nào.
 *
 * Trước đây ba màn phía thí sinh nói ba kiểu khác nhau về cùng một chuyện:
 *   · `/dashboard` hiện thẳng điểm lấy từ phiếu mới nhất (kể cả điểm MÁY chưa ai xác nhận),
 *   · ngay dưới đó lại ghi "Điểm chỉ hiển thị sau khi BTC xác nhận và công bố",
 *   · `/dashboard/results` thì khẳng định "trước đó không ai thấy điểm của bạn".
 *
 * Luật thống nhất, dùng đúng từ vựng của màn chấm điểm bên BTC:
 *   · có phiếu giám khảo (`judges`)  → hội đồng đã chốt, thí sinh XEM ĐƯỢC;
 *   · chỉ có điểm máy (`external_ai`) → chưa cho xem, vì hội đồng còn đang đối chiếu và con số
 *     rất có thể đổi — cho xem rồi rút lại là cách nhanh nhất để mất niềm tin vào bảng điểm;
 *   · chưa có gì (`none`) → chưa chấm.
 *
 * Thể lệ yêu cầu "trả điểm ý tưởng cho người dự thi" ở Phase 1 — luật này vẫn trả, chỉ trả SAU
 * khi hội đồng xác nhận chứ không trả điểm máy thô.
 */
export type ScoreBasis = "judges" | "external_ai" | "none";

export type CandidateScoreView =
  | { visible: true; value: number; judgeCount: number }
  | { visible: false; label: string; hint: string };

export function candidateScoreView(
  agg: { value: number; basis: ScoreBasis; judgeCount: number } | undefined
): CandidateScoreView {
  if (!agg || agg.basis === "none") {
    return {
      visible: false,
      label: "Chưa chấm",
      hint: "Bài của bạn chưa vào lượt chấm.",
    };
  }
  if (agg.basis === "external_ai") {
    return {
      visible: false,
      label: "Đang đối chiếu",
      // Câu hiển thị cho THÍ SINH cố ý không nêu cơ chế chấm — công bố cơ chế ra ngoài là biến
      // một cách vận hành nội bộ thành cam kết phải giữ đúng từng chữ. Chỉ nói trạng thái.
      hint: "Hội đồng đang chấm mục này. Điểm hiện ra sau khi chốt.",
    };
  }
  return { visible: true, value: agg.value, judgeCount: agg.judgeCount };
}
