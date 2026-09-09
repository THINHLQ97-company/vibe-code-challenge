import type { Submission } from "./db/schema";

/**
 * CP1–CP6 — mốc bắt buộc theo thể lệ. Một nguồn sự thật duy nhất cho: bảng "Mốc bắt buộc" ở
 * dashboard thí sinh, cột chặn ở màn BTC, và cổng chặn của API công bố kết quả.
 *
 * Trước đây mỗi chỗ tự liệt kê một danh sách riêng: dashboard đòi đủ 6 mốc, còn API `publish`
 * chỉ kiểm CP4 + CP5 → admin bấm được nút công bố cho người CHƯA nộp phiếu trải nghiệm, tức là
 * công nhận đậu sai thể lệ. Sửa ở đây thì cả ba nơi đổi cùng lúc.
 */
export type Checkpoint = {
  code: "CP1" | "CP2" | "CP3" | "CP4" | "CP5" | "CP6";
  label: string;
  done: boolean;
  /** Câu báo khi mốc này chặn việc công bố. */
  blocker: string;
};

type CheckpointInput = Pick<
  Submission,
  | "registrationStatus"
  | "githubVerifiedAt"
  | "securityStatus"
  | "facebookApprovedAt"
  | "surveySubmittedAt"
>;

export function getCheckpoints(s: CheckpointInput): Checkpoint[] {
  return [
    { code: "CP1", label: "CP1 · Đăng ký dự thi", done: true, blocker: "chưa đăng ký dự thi" },
    {
      code: "CP2",
      label: "CP2 · Đề tài được duyệt",
      done: s.registrationStatus === "approved",
      blocker: "đề tài chưa được duyệt (CP2)",
    },
    {
      code: "CP3",
      label: "CP3 · Nộp Vibe Host + mã nguồn",
      done: !!s.githubVerifiedAt,
      blocker: "chưa xác minh mã nguồn (CP3)",
    },
    {
      code: "CP4",
      label: "CP4 · Qua cổng an toàn",
      done: s.securityStatus === "clean",
      blocker: "chưa qua cổng rà soát an toàn (CP4)",
    },
    {
      code: "CP5",
      label: "CP5 · Đăng bài & BGK duyệt",
      done: !!s.facebookApprovedAt,
      blocker: "chưa duyệt bài đăng (CP5)",
    },
    {
      code: "CP6",
      label: "CP6 · Phiếu trải nghiệm",
      done: !!s.surveySubmittedAt,
      blocker: "chưa nộp phiếu trải nghiệm (CP6)",
    },
  ];
}

/** Các mốc còn thiếu, dạng câu để ghép vào thông báo cho BTC. */
export function missingCheckpoints(s: CheckpointInput): string[] {
  return getCheckpoints(s)
    .filter((c) => !c.done)
    .map((c) => c.blocker);
}
