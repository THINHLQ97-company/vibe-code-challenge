import type { HTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "../../tv";

export const separatorVariants = tv({
  base: "shrink-0 bg-stroke",
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={separatorVariants({ orientation, className })}
      {...props}
    />
  );
}
