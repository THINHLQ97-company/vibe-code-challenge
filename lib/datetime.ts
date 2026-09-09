/**
 * MỘT chỗ duy nhất định dạng ngày/giờ (cổng NGAYTHANG của DSVH — app từng có BẢY kiểu
 * ngày khác nhau vì mỗi màn tự gọi toLocaleDateString với option riêng).
 * Mọi nơi hiển thị ngày PHẢI gọi qua đây, không tự gõ toLocaleDateString.
 */
const TZ = "Asia/Ho_Chi_Minh";

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** 09/09/2026 */
export function formatDateVN(value: string | number | Date): string {
  return toDate(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TZ,
  });
}

/** 09/09/2026 15:22 */
export function formatDateTimeVN(value: string | number | Date): string {
  return toDate(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

/** "còn 12 ngày" / "quá hạn 3 ngày" — dùng cho hạn nộp bài. */
export function formatDeadlineDistance(deadline: string | number | Date): string {
  const days = Math.ceil((toDate(deadline).getTime() - Date.now()) / 86_400_000);
  if (days > 0) return `còn ${days} ngày`;
  if (days === 0) return "hết hạn hôm nay";
  return `quá hạn ${Math.abs(days)} ngày`;
}
