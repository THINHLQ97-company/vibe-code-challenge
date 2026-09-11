/**
 * BAREM ĐIỂM — nguồn sự thật duy nhất.
 *
 * Dùng chung cho: giao diện chấm của giám khảo, bảng điểm thí sinh, phần "Cách chấm" trên trang
 * giới thiệu, phép kiểm ở cổng API, và tài liệu gửi đội làm công cụ chấm.
 *
 * Vì sao gom về một chỗ: trước đây barem nằm rải bốn nơi và ĐÃ LỆCH NHAU thật. Trang giới thiệu
 * liệt kê bốn nhóm phẳng không theo phase, trong khi hệ thống chấm theo phase; cổng API nhận
 * `Record<string, number>` nên chấp nhận mọi khoá; bảng bậc lan tỏa được gõ lại lần hai trong màn
 * chia sẻ của thí sinh. Mỗi bản sao là một cơ hội để chúng nói khác nhau.
 */
export type ModuleKey = "giaTriUngDung" | "chatLuongKyThuat" | "hoanThien";

export type RubricModule = {
  key: ModuleKey;
  label: string;
  max: number;
  phase: 1 | 2;
  /** Công cụ chấm cần đọc gì để cho điểm mục này. */
  basis: string;
  /** Câu mô tả dành cho thí sinh, hiện trên trang giới thiệu. */
  publicNote: string;
};

export const RUBRIC: RubricModule[] = [
  {
    key: "giaTriUngDung",
    label: "Giá trị ứng dụng",
    max: 25,
    phase: 1,
    basis: "Tài liệu PRD, bài toán, người dùng mục tiêu",
    publicNote: "Bài toán có thật và sản phẩm giải được nó",
  },
  {
    key: "chatLuongKyThuat",
    label: "Chất lượng kỹ thuật",
    max: 40,
    phase: 2,
    basis: "Mã nguồn trên GitHub, lịch sử commit",
    publicNote: "Chức năng chạy đúng · database dùng thật · mở tốt trên di động",
  },
  {
    key: "hoanThien",
    label: "Độ hoàn thiện",
    max: 15,
    phase: 2,
    basis: "Sản phẩm chạy thật trên Vibe Host",
    publicNote: "Không còn phần dang dở, nội dung là của bạn",
  },
];

/**
 * Bậc điểm lan tỏa (Phase 3). KHÔNG phải một phiếu chấm: điểm quy đổi từ lượt tương tác của bài
 * đăng so với trung vị của nhóm cùng tuần, ban tổ chức chốt bậc trên giao diện quản trị.
 */
export const ENGAGEMENT_TIERS = [
  { tier: 4, point: 20, label: "Trên 200% trung vị" },
  { tier: 3, point: 15, label: "120–200% trung vị" },
  { tier: 2, point: 10, label: "70–119% trung vị" },
  { tier: 1, point: 5, label: "Dưới 70% trung vị" },
] as const;

export const ENGAGEMENT_MAX = 20;

/** Barem gom theo PHASE — đúng thứ tự thí sinh đi qua, và đúng cách hai giao diện đang hiển thị. */
export const PHASE_GROUPS = [
  {
    phase: 1 as const,
    label: "Ý tưởng",
    total: 25,
    scoredByAi: true,
    summary: "Chấm trên tài liệu PRD ngay sau khi BTC duyệt đề tài",
  },
  {
    phase: 2 as const,
    label: "Sản phẩm",
    total: 55,
    scoredByAi: true,
    summary: "Chấm trên sản phẩm chạy thật và mã nguồn bạn nộp",
  },
  {
    phase: 3 as const,
    label: "Lan tỏa",
    total: ENGAGEMENT_MAX,
    scoredByAi: false,
    summary: "Quy đổi từ lượt tương tác bài chia sẻ trong bảy ngày",
  },
];

export const TOTAL_MAX = RUBRIC.reduce((s, m) => s + m.max, 0) + ENGAGEMENT_MAX;

export function modulesForPhase(phase: 1 | 2): RubricModule[] {
  return RUBRIC.filter((m) => m.phase === phase);
}

/** Bậc tương tác → điểm. Bậc trống (chưa chốt) = 0. */
export function engagementTierToScore(tier: number | null): number {
  return ENGAGEMENT_TIERS.find((t) => t.tier === tier)?.point ?? 0;
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
