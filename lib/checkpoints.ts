import type { Submission } from "./db/schema";

/**
 * CP1–CP6 — mốc bắt buộc theo thể lệ. Một nguồn sự thật duy nhất cho: bảng "Mốc bắt buộc" ở
 * dashboard thí sinh, cột chặn ở màn BTC, và cổng chặn của API công bố kết quả.
 *
 * Trước đây mỗi chỗ tự liệt kê một danh sách riêng: dashboard đòi đủ 6 mốc, còn API `publish`
 * chỉ kiểm CP4 + CP5 → admin bấm được nút công bố cho người CHƯA nộp phiếu trải nghiệm, tức là
 * công nhận đậu sai thể lệ. Sửa ở đây thì cả ba nơi đổi cùng lúc.
 */
/**
 * Trạng thái của MỘT mốc, dùng chung cho cả huy hiệu lẫn màu:
 *   `done`     — đã qua (teal)
 *   `rejected` — bị trả về / gắn cờ, đang chờ THÍ SINH sửa (đỏ)
 *   `current`  — đang tới lượt, việc kế tiếp phải làm (cam)
 *   `pending`  — chưa tới lượt (xám)
 */
export type CheckpointState = "done" | "rejected" | "current" | "pending";

export type Checkpoint = {
  code: "CP1" | "CP2" | "CP3" | "CP4" | "CP5" | "CP6";
  label: string;
  done: boolean;
  state: CheckpointState;
  /** Vì sao đang bị chặn — chỉ có khi `state === "rejected"`. */
  reason?: string | null;
  /** Câu báo khi mốc này chặn việc công bố. */
  blocker: string;
};

type CheckpointInput = Pick<
  Submission,
  | "registrationStatus"
  | "registrationNote"
  | "githubVerifiedAt"
  | "githubVerifyError"
  | "securityStatus"
  | "securityNote"
  | "facebookPostUrl"
  | "facebookApprovedAt"
  | "surveySubmittedAt"
> &
  Partial<Pick<Submission, "isPrebuiltRepo" | "prebuiltNote" | "vibehostUrl">>;

export function getCheckpoints(s: CheckpointInput): Checkpoint[] {
  const raw: Omit<Checkpoint, "state">[] = [
    { code: "CP1", label: "CP1 · Đăng ký dự thi", done: true, blocker: "chưa đăng ký dự thi" },
    {
      code: "CP2",
      label: "CP2 · Đề tài được duyệt",
      done: s.registrationStatus === "approved",
      reason: s.registrationStatus === "returned" ? (s.registrationNote ?? "Đề tài bị trả về") : null,
      blocker: "đề tài chưa được duyệt (CP2)",
    },
    {
      code: "CP3",
      label: "CP3 · Nộp Vibe Host + mã nguồn",
      done: !!s.githubVerifiedAt,
      reason: s.isPrebuiltRepo
        ? (s.prebuiltNote ?? "Bị gắn cờ dùng repo/mẫu có sẵn")
        : s.githubVerifyError || null,
      blocker: "chưa xác minh mã nguồn (CP3)",
    },
    {
      code: "CP4",
      label: "CP4 · Qua cổng an toàn",
      done: s.securityStatus === "clean",
      reason:
        s.securityStatus === "flagged" ? (s.securityNote ?? "Bị gắn cờ ở cổng an toàn") : null,
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

  /**
   * Mốc đầu tiên CHƯA xong là mốc "đang tới lượt". Trước đây danh sách chỉ có xong/chưa xong, nên
   * sáu ô chưa xong trông giống hệt nhau và thí sinh không biết phải bắt tay vào cái nào.
   */
  const firstUndone = raw.findIndex((c) => !c.done);
  return raw.map((c, i) => {
    if (c.done) return { ...c, state: "done" as const };
    if (c.reason) return { ...c, state: "rejected" as const };
    return { ...c, state: i === firstUndone ? ("current" as const) : ("pending" as const) };
  });
}

/** Các mốc còn thiếu, dạng câu để ghép vào thông báo cho BTC. */
export function missingCheckpoints(s: CheckpointInput): string[] {
  return getCheckpoints(s)
    .filter((c) => !c.done)
    .map((c) => c.blocker);
}
