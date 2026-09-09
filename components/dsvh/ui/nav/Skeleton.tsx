import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "circle" | "rect";
}

const variantClasses = {
  text: "h-4 rounded",
  circle: "rounded-full",
  rect: "rounded-lg",
};

/**
 * Khung xương lúc chờ dữ liệu.
 *
 * `cn()` (twMerge) chứ KHÔNG nối chuỗi thường — sửa 14/08/2026. Bản cũ ghép
 * `` nên `rounded-lg` của variant và
 * `rounded-*` của nơi gọi CÙNG TỒN TẠI, và thắng thua do thứ tự trong stylesheet đã biên dịch quyết,
 * không phải thứ tự viết. Hậu quả đo được ở /admin/dashboard: `` ra
 * **8px** (variant thắng) trong khi `` ra 12px (nơi gọi thắng) — tức là
 * cùng một cách viết mà kết quả ngược nhau tuỳ tên lớp, và bo góc tuỳ chọn có thể bị nuốt trong im
 * lặng. `rounded-card` (token DSVH) là bên luôn thua, nên KHÔNG khung xương nào bo được 16px cho
 * đúng thẻ nó đang thay chỗ.
 *
 * Đây là đúng lỗi đã bắt ở `Card` (xem ghi chú `cn()` trong `ui/Card.tsx`) và ở
 * `Input`/`Select`/`Textarea` (`w-full` gốc không bị đè đúng). Lần này nó ăn vào bo góc.
 *
 * Không đổi gì với các nơi gọi khác: 22 chỗ còn lại truyền `rounded-xl`/`rounded-lg`/`rounded-full`,
 * đều là bên đang thắng sẵn — `cn()` giữ nguyên luật "nơi gọi nói sau thì nơi gọi thắng".
 */
export function Skeleton({
  className = "",
  variant = "rect",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse bg-stroke-soft", variantClasses[variant], className)}
    />
  );
}
