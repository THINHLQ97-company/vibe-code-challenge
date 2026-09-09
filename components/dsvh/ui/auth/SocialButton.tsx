import { type VariantProps } from "tailwind-variants";
import { tv } from "../../tv";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * `size` khớp CHIỀU CAO với `Button` (xem ui/Button.tsx) — SocialButton hay đứng
 * cạnh/ngay dưới 1 Button (vd nút "Đăng nhập" + "Đăng nhập với Google") nên phải
 * cùng scale, không thì lệch pixel (đã bắt được: h-11 vs padding-derived ~43px).
 * Mặc định "md" giữ nguyên hành vi cũ.
 */
const socialButton = tv({
  base: "flex w-full items-center justify-center gap-2.5 rounded-lg border border-stroke bg-surface text-ink transition-all duration-200 hover:border-stroke-hover hover:bg-stroke-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
  variants: {
    size: {
      sm: "h-8 px-3 text-caption",
      md: "h-9 px-4 text-body",
      lg: "h-11 px-5 text-body font-medium",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SocialButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof socialButton> {
  icon: ReactNode;
  children: ReactNode;
}

export function SocialButton({ icon, children, size, className, ...rest }: SocialButtonProps) {
  return (
    <button type="button" className={socialButton({ size, className })} {...rest}>
      <span className="grid size-5 shrink-0 place-items-center">{icon}</span>
      {children}
    </button>
  );
}
