import type { ReactNode, HTMLAttributes } from "react";
import { tv } from "../../tv";

export const kbdVariants = tv({
  base: "inline-flex items-center justify-center whitespace-nowrap min-w-[20px] px-1.5 py-0.5 text-caption tabular-nums font-medium text-ink-2 bg-surface-2 border border-stroke rounded-md shadow-xs select-none",
});

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd className={kbdVariants({ className })} {...props}>
      {children}
    </kbd>
  );
}
