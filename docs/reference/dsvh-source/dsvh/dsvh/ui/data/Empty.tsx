import type { ReactNode } from "react";
import { tv } from "../../tv";

/**
 * TRẠNG THÁI RỖNG — một component cho cả app.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * VÌ SAO GỘP (11/08/2026)
 *
 * Trước bản này có HAI bản trạng thái rỗng cùng sống: `Empty` ở DSVH (0 nơi dùng) và `EmptyState`
 * ở `shared/` (25 chỗ, 18 tệp). Không bản nào nhắc tới bản kia, nên tài liệu nói một đằng còn app
 * chạy một nẻo — ai mở `/dsvh` ra sẽ dùng bản KHÔNG giống bất kỳ màn nào đang chạy.
 *
 * Đọc kỹ thì chúng không trùng ngẫu nhiên, mà là HAI NGỮ CẢNH thật:
 *   · bản `shared` nằm TRONG một khối đã có khung (thẻ, tab) → không được mang khung thứ hai.
 *   · bản DSVH đứng MỘT MÌNH giữa trang → phải tự mang khung, nếu không nó trôi lơ lửng.
 * Nên lời giải không phải xoá một bản, mà là MỘT component với hai `variant` kèm một câu luật nói
 * rõ khi nào dùng bên nào — đúng thứ mà hai bản rời nhau không bao giờ nói được.
 *
 * SỬA LUÔN MỘT VI PHẠM LUẬT: bản cũ bọc icon trong chấm tròn `text-orange`. Luật #8 (chủ dự án nêu
 * hai lần) nói icon TRANG TRÍ phải xám — màu chỉ dành cho thứ mang NGHĨA trạng thái. Một màn trống
 * không phải lỗi, tô cam nó là nói dối người dùng bằng màu.
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 */

export const emptyVariants = tv({
  base: "flex flex-col items-center justify-center text-center",
  variants: {
    variant: {
      /* `py-6` chứ không `py-12`: khối này thường nằm trong `Card` vốn đã có đệm dọc, cộng thêm
         3rem nữa làm thẻ cao gần gấp đôi phần nội dung thật (đo ở thẻ "Sự kiện gần đây", 30/07). */
      inline: "py-6",
      block: "rounded-card border border-stroke bg-surface p-8",
    },
  },
  defaultVariants: { variant: "inline" },
});

export type EmptyVariant = "inline" | "block";

export interface EmptyProps {
  /** icon dạng PHẦN TỬ: `icon={<BackupIcon size={40} />}` — cùng quy ước với CardHeader/Button */
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  /** nút đưa người dùng đi tiếp — xem luật ở manifest, đây gần như luôn là thứ bắt buộc */
  action?: ReactNode;
  variant?: EmptyVariant;
  className?: string;
}

export function Empty({ icon, title, description, action, variant = "inline", className }: EmptyProps) {
  return (
    <div className={emptyVariants({ variant, className })}>
      {icon ? <span className="mb-2 text-ink-3">{icon}</span> : null}
      {/* Tiêu đề vai CHÍNH nhưng KHÔNG in đậm: đây là một câu thông báo, không phải tiêu đề khu
          vực. In đậm làm nó tranh chấp với tiêu đề thật của thẻ đang chứa nó. */}
      <p className="text-body text-ink-2">{title}</p>
      {description ? <p className="mt-1 max-w-md text-caption text-ink-3">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
