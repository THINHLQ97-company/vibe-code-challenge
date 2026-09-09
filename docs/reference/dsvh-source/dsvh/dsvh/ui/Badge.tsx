import { type VariantProps } from "tailwind-variants";
import { tv } from "../tv";
import type { ReactNode } from "react";
import { statusStyles } from "@/components/dsvh/status";

const shell = tv({
  base: "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
  variants: {
    size: {
      sm: "px-1.5 py-0.5 text-micro",
      md: "px-2 py-0.5 text-caption",
    },
  },
  defaultVariants: { size: "md" },
});

export type BadgeTone =
  | "neutral"
  | "accent"
  | "outline"
  | "success"
  | "warning"
  | "danger";

/**
 * Tone → classes. Status tones (success/warning/danger) lấy từ MỘT NGUỒN
 * `statusStyles` — đổi tone ở status.ts thì Badge tự đổi theo.
 */
const toneClass: Record<BadgeTone, string> = {
  neutral: "bg-stroke-soft text-ink-2",
  /* `orange-strong`: cùng lý do với nút chính — TRẮNG trên `#de4400` đo được 4.26:1, trượt AA.
     Badge accent còn nhỏ hơn nút (10–12px) nên càng không được mượn ngưỡng "chữ lớn". */
  accent: "bg-orange-strong text-white",
  outline: "border border-stroke text-ink-3",
  success: statusStyles.success.softPill,
  warning: statusStyles.warning.softPill,
  danger: statusStyles.error.softPill,
};

export type BadgeProps = VariantProps<typeof shell> & {
  tone?: BadgeTone;
  children: ReactNode;
  /** Chú thích đầy đủ khi rê chuột — nhãn hay bị viết tắt ("db", "FREE", "ok"). */
  title?: string;
  className?: string;
};

/**
 * `title` được chuyển tiếp (08/08): nhãn thường bị rút ngắn hoặc viết tắt ("db", "FREE", "ok") nên
 * chỗ gọi cần nói đầy đủ nghĩa khi rê chuột. Trước bản này `Badge` nuốt mất prop đó — nơi gọi phải
 * bọc thêm một `<span title>` bên ngoài, tức một thẻ thừa chỉ để giữ một thuộc tính HTML sẵn có.
 * Bắt được khi bỏ shadcn ở `/admin/settings` (đợt 1).
 */
export function Badge({ tone = "neutral", size, className = "", title, children }: BadgeProps) {
  return (
    <span title={title} className={shell({ size, className: `${toneClass[tone]} ${className}` })}>
      {children}
    </span>
  );
}
