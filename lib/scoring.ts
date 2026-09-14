// Barem thể lệ mục F. Các con số KHÔNG khai ở đây — xem `lib/scoring-rubric.ts`, nguồn duy nhất.
import { engagementTierToScore, RUBRIC, ENGAGEMENT_MAX } from "./scoring-rubric";

export { engagementTierToScore };

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

export const TECHNICAL_MAX = RUBRIC.find((m) => m.key === "chatLuongKyThuat")!.max;
const COMPLETION_MAX = RUBRIC.find((m) => m.key === "hoanThien")!.max;
const VALUE_MAX = RUBRIC.find((m) => m.key === "giaTriUngDung")!.max;
const TOTAL_MAX = TECHNICAL_MAX + COMPLETION_MAX + VALUE_MAX + ENGAGEMENT_MAX;

/**
 * Không còn trần điểm kỹ thuật theo cách deploy: dùng repo có sẵn nay là VI PHẠM (chặn ở Phase 2),
 * không phải một lựa chọn hợp lệ bị trừ điểm. Mọi bài vào tới đây đều chấm trên thang 40 đầy đủ.
 */
export function computeFinalScore(params: {
  technicalRaw: number; // /40
  completion: number; // /15
  applicationValue: number; // /25
  engagementTier: number | null;
  /**
   * Điểm thưởng đăng ký sớm theo đợt thi. Cộng NGOÀI thang 100 chứ không nằm trong: nó thưởng cho
   * thời điểm đăng ký, không phải cho chất lượng bài — gộp vào 100 là làm loãng phần đo chất lượng
   * và khiến một bài hoàn hảo ở wave cuối không bao giờ đạt được điểm tuyệt đối của barem.
   */
  waveBonus?: number;
}): number {
  const technical = Math.min(params.technicalRaw, TECHNICAL_MAX);
  const completion = Math.min(params.completion, COMPLETION_MAX);
  const applicationValue = Math.min(params.applicationValue, VALUE_MAX);
  const engagement = engagementTierToScore(params.engagementTier);
  const base = Math.min(technical + completion + applicationValue + engagement, TOTAL_MAX);
  const total = base + Math.max(0, params.waveBonus ?? 0);
  // Trung bình nhiều giám khảo hay ra số lẻ dài (vd 3 người → x.6666). Chốt 1 chữ số thập phân
  // để bảng xếp hạng và khiếu nại đối chiếu được cùng một con số.
  return Math.round(total * 10) / 10;
}
