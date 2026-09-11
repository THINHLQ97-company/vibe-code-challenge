/**
 * BAREM ĐIỂM — nguồn sự thật duy nhất, dùng chung cho giao diện chấm của giám khảo, cho phép kiểm
 * dữ liệu ở cổng API, và cho tài liệu gửi đội làm công cụ chấm.
 *
 * Trước đây barem nằm rải: trần điểm gõ thẳng trong `app/admin/scoring/[id]/page.tsx`, còn cổng
 * API nhận `Record<string, number>` tức CHẤP NHẬN MỌI KHOÁ. Công cụ ngoài gõ nhầm `giatriUngDung`
 * (thiếu dấu hoa) là điểm vẫn lưu thành công, rồi phần tổng hợp đọc `giaTriUngDung` không thấy gì
 * nên trả 0 — bài bị 0 điểm mà cổng API đã báo "ghi nhận thành công".
 */
export type ModuleKey = "giaTriUngDung" | "chatLuongKyThuat" | "hoanThien";

export type RubricModule = {
  key: ModuleKey;
  label: string;
  max: number;
  phase: 1 | 2;
  /** Công cụ chấm cần đọc gì để cho điểm mục này. */
  basis: string;
};

export const RUBRIC: RubricModule[] = [
  {
    key: "giaTriUngDung",
    label: "Giá trị ứng dụng",
    max: 25,
    phase: 1,
    basis: "Tài liệu PRD, bài toán, người dùng mục tiêu",
  },
  {
    key: "chatLuongKyThuat",
    label: "Chất lượng kỹ thuật",
    max: 40,
    phase: 2,
    basis: "Mã nguồn trên GitHub, lịch sử commit",
  },
  {
    key: "hoanThien",
    label: "Độ hoàn thiện",
    max: 15,
    phase: 2,
    basis: "Sản phẩm chạy thật trên Vibe Host",
  },
];

/** Điểm lan tỏa KHÔNG nằm ở đây: nó tính theo bậc tương tác, không phải một phiếu chấm. */
export const ENGAGEMENT_MAX = 20;

export const TOTAL_MAX = RUBRIC.reduce((s, m) => s + m.max, 0) + ENGAGEMENT_MAX;

export function modulesForPhase(phase: 1 | 2): RubricModule[] {
  return RUBRIC.filter((m) => m.phase === phase);
}

/**
 * Kiểm bộ điểm gửi lên có đúng barem của phase không.
 *
 * Chặt cả hai chiều: thiếu mục nào cũng không nhận (điểm thiếu mục là điểm sai, không phải điểm
 * một phần), và thừa khoá lạ cũng không nhận (khoá lạ gần như luôn là gõ sai tên).
 */
export function validateModuleScores(
  phase: 1 | 2,
  scores: Record<string, number>
): { ok: true } | { ok: false; error: string } {
  const expected = modulesForPhase(phase);
  const expectedKeys = expected.map((m) => m.key);

  const unknown = Object.keys(scores).filter((k) => !expectedKeys.includes(k as ModuleKey));
  if (unknown.length > 0) {
    return {
      ok: false,
      error: `Khoá không thuộc barem Phase ${phase}: ${unknown.join(", ")}. Cho phép: ${expectedKeys.join(", ")}`,
    };
  }

  for (const m of expected) {
    const v = scores[m.key];
    if (v === undefined) {
      return { ok: false, error: `Thiếu điểm mục "${m.key}" của Phase ${phase}` };
    }
    if (!Number.isFinite(v) || v < 0 || v > m.max) {
      return { ok: false, error: `Điểm "${m.key}" phải nằm trong khoảng 0–${m.max}, nhận được ${v}` };
    }
  }
  return { ok: true };
}
