/**
 * LỊCH CUỘC THI — khung giờ đăng bài và bảng lịch gốc của mùa 1.
 *
 * Ngày giờ THẬT của từng đợt nằm trong bảng `waves` dưới database, không nằm ở đây: ban tổ chức
 * dời lịch là chuyện bình thường, mà một bản lịch gõ cứng trong mã thì dời xong hai chỗ nói khác
 * nhau. Tệp này chỉ giữ hai thứ KHÔNG đổi theo đợt:
 *
 *   · ba khung giờ đăng bài trong ngày, và
 *   · hạn mức mặc định của từng khung (bảng 3 ngày × 3 khung = 40 suất, đúng trần một đợt).
 *
 * Bảng `SEASON_1_SCHEDULE` ở cuối là bản lịch ban tổ chức đã chốt, dùng ĐÚNG MỘT LẦN để nạp vào
 * database (migration 0018). Sau khi nạp, mọi màn hình đọc từ database.
 */

export type PostingPeriod = "sang" | "chieu" | "toi";

export const POSTING_PERIODS: {
  key: PostingPeriod;
  label: string;
  timeLabel: string;
  /** Giờ bắt đầu/kết thúc theo giờ Việt Nam — dùng để dựng mốc thời gian của khung. */
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}[] = [
  { key: "sang", label: "Sáng", timeLabel: "8h30 – 12h00", startHour: 8, startMinute: 30, endHour: 12, endMinute: 0 },
  { key: "chieu", label: "Chiều", timeLabel: "13h00 – 17h30", startHour: 13, startMinute: 0, endHour: 17, endMinute: 30 },
  { key: "toi", label: "Tối", timeLabel: "18h00 – 22h00", startHour: 18, startMinute: 0, endHour: 22, endMinute: 0 },
];

export function periodLabel(key: PostingPeriod): string {
  return POSTING_PERIODS.find((p) => p.key === key)?.label ?? key;
}

export function periodTimeLabel(key: PostingPeriod): string {
  return POSTING_PERIODS.find((p) => p.key === key)?.timeLabel ?? "";
}

/**
 * Hạn mức mặc định: ngày 1 và 2 mỗi khung 5 suất, ngày 3 rút còn 4/3/3.
 *
 * Tổng đúng 40 — bằng trần một đợt, nên mọi thí sinh vào tới Phase 3 đều có chỗ. Ngày cuối ít hơn
 * vì bài đăng ngày cuối còn phải đếm đủ bảy ngày tương tác trước khi đợt khép lại.
 */
export const DEFAULT_SLOT_QUOTA: Record<PostingPeriod, number>[] = [
  { sang: 5, chieu: 5, toi: 5 },
  { sang: 5, chieu: 5, toi: 5 },
  { sang: 4, chieu: 3, toi: 3 },
];

export const POSTING_DAYS = DEFAULT_SLOT_QUOTA.length;

export const TOTAL_SLOT_CAPACITY = DEFAULT_SLOT_QUOTA.reduce(
  (sum, day) => sum + day.sang + day.chieu + day.toi,
  0
);

/** Mốc bắt đầu của một khung giờ, tính theo giờ Việt Nam từ ngày (UTC midnight của ngày đó). */
export function slotStartsAt(dayStart: Date, period: PostingPeriod): Date {
  const p = POSTING_PERIODS.find((x) => x.key === period)!;
  // Giờ Việt Nam = UTC+7, không có giờ mùa hè — trừ thẳng 7 là ra mốc UTC tương ứng.
  return new Date(
    Date.UTC(
      dayStart.getUTCFullYear(),
      dayStart.getUTCMonth(),
      dayStart.getUTCDate(),
      p.startHour - 7,
      p.startMinute
    )
  );
}
