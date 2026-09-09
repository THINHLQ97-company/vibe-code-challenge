import { type VariantProps } from "tailwind-variants";
import { tv } from "../tv";

const fill = tv({
  base: "h-full rounded-full transition-[width] duration-500",
  variants: {
    tone: {
      orange: "bg-orange-bright",
      teal: "bg-teal",
      /**
       * CẢNH BÁO — luật #7: cảnh báo là AMBER, không phải đỏ (đỏ dành cho lỗi thật).
       *
       * Thêm 14/08/2026. Trước đó `Progress` có đủ teal/đỏ nhưng THIẾU đúng bậc giữa, nên chỗ nào
       * cần "sắp chạm ngưỡng" chỉ còn hai lối: nhảy thẳng sang đỏ (nói quá, và làm đỏ mất nghĩa) hay
       * ở lại teal (nói thiếu). `ResourceMeter` đã phải tự vẽ thanh riêng một phần vì lý do này.
       *
       * KHÔNG gộp với `orange`: cam ở DSVH là màu THƯƠNG HIỆU (nút chính, tiến độ trung tính), amber
       * là màu TRẠNG THÁI. Hai màu gần nhau nhưng khác vai — dùng cam cho cảnh báo thì một thanh
       * tiến độ bình thường và một thanh sắp đầy đĩa trông giống hệt nhau.
       */
      amber: "bg-amber",
      ink: "bg-ink",
      red: "bg-red",
    },
  },
  defaultVariants: { tone: "orange" },
});

export type ProgressProps = VariantProps<typeof fill> & {
  /** 0–100 */
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  /**
   * Chạy MƯỢT theo % thay vì nhảy từng nấc — dùng cho tiến trình có cập nhật dồn dập (poll job
   * deploy). Đổi `width` mỗi lượt poll làm thanh giật; chuyển bằng `transform` thì mắt đọc ra một
   * chuyển động liên tục. Không đổi hình dáng, chỉ đổi cách đi.
   */
  showShimmer?: boolean;
  className?: string;
};

export function Progress({
  value,
  tone,
  size = "md",
  showValue = false,
  showShimmer = false,
  className = "",
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`flex-1 overflow-hidden rounded-full bg-stroke-soft ${
          size === "sm" ? "h-1.5" : "h-2"
        }`}
      >
        {showShimmer ? (
          <div
            className={`${fill({ tone })} h-full w-full origin-left transition-transform duration-500 ease-out`}
            style={{ transform: `scaleX(${pct / 100})` }}
          />
        ) : (
          <div className={fill({ tone })} style={{ width: `${pct}%` }} />
        )}
      </div>
      {showValue && (
        <span className="w-9 shrink-0 text-right text-caption font-semibold text-ink">
          {pct}%
        </span>
      )}
    </div>
  );
}
