/**
 * Thể lệ phản biện: MỘT vòng duy nhất, trong 48h kể từ lúc BTC công bố điểm.
 *
 * Luật này phải nằm chung một chỗ cho cả UI lẫn API. Trước đây chỉ trang kết quả biết luật —
 * API `POST /api/submissions/[id]/appeals` nhận mọi lúc, mọi số lần, nên chỉ cần gọi thẳng
 * endpoint là gửi được phản biện thứ hai hoặc gửi sau khi đã hết hạn.
 */
export const APPEAL_WINDOW_HOURS = 48;

export type AppealGate =
  | { open: true }
  | { open: false; reason: string };

export function checkAppealGate(input: {
  publishedAt: Date | null;
  existingAppeals: number;
}): AppealGate {
  if (!input.publishedAt) {
    return { open: false, reason: "Chưa công bố điểm nên chưa mở phản biện" };
  }
  if (input.existingAppeals > 0) {
    return { open: false, reason: "Mỗi bài chỉ được phản biện một lần" };
  }
  const hours = (Date.now() - new Date(input.publishedAt).getTime()) / 3_600_000;
  if (hours > APPEAL_WINDOW_HOURS) {
    return {
      open: false,
      reason: `Đã quá ${APPEAL_WINDOW_HOURS}h kể từ lúc công bố — kết quả là chung cuộc`,
    };
  }
  return { open: true };
}
