// Barem thể lệ mục F: Chất lượng kỹ thuật 40 · Hoàn thiện 15 · Giá trị ứng dụng 25 · Lan tỏa 20.

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Bậc điểm lan tỏa so trung vị cùng khung giờ/tuần (thể lệ mục F).
export function engagementTierFromCount(count: number, cohort: number[]): number {
  const m = median(cohort);
  if (m <= 0) return count > 0 ? 4 : 1;
  const ratio = count / m;
  if (ratio > 2) return 4;
  if (ratio >= 1.2) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}

export function engagementTierToScore(tier: number | null): number {
  switch (tier) {
    case 4:
      return 20;
    case 3:
      return 15;
    case 2:
      return 10;
    case 1:
      return 5;
    default:
      return 0;
  }
}

export function computeFinalScore(params: {
  technicalRaw: number; // /40 gốc
  isPrebuiltRepo: boolean;
  completion: number; // /15
  applicationValue: number; // /25
  engagementTier: number | null;
}): number {
  const technicalCap = params.isPrebuiltRepo ? 20 : 40;
  const technical = Math.min(params.technicalRaw, technicalCap);
  const completion = Math.min(params.completion, 15);
  const applicationValue = Math.min(params.applicationValue, 25);
  const engagement = engagementTierToScore(params.engagementTier);
  const total = Math.min(technical + completion + applicationValue + engagement, 100);
  // Trung bình nhiều giám khảo hay ra số lẻ dài (vd 3 người → x.6666). Chốt 1 chữ số thập phân
  // để bảng xếp hạng và khiếu nại đối chiếu được cùng một con số.
  return Math.round(total * 10) / 10;
}
