"use client";

import type { ReactNode, MouseEvent } from "react";
import { CloseIcon } from "@/components/dsvh/icons";
import { type VariantProps } from "tailwind-variants";
import { tv } from "../../tv";

export const tagVariants = tv({
  /* `flex-nowrap` + `shrink-0`: `whitespace-nowrap` chỉ chặn CHỮ xuống dòng, không chặn FLEX xuống
     dòng — chip có icon vẫn tách icon lên trên, chữ xuống dưới khi cột hẹp (đo được ở cột "Phân
     loại": cao 40px thay vì 28px). Hai cơ chế khác nhau, phải chặn cả hai. */
  base: "inline-flex flex-nowrap shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 py-1 text-caption font-medium rounded-md border transition-colors select-none",
  variants: {
    tone: {
      neutral: "bg-surface-2 text-ink-2 border-stroke",
      accent: "bg-surface-2 text-orange border-orange/30",
      success: "bg-surface-2 text-teal border-teal/30",
      danger: "bg-surface-2 text-orange border-orange",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export type TagTone = "neutral" | "accent" | "success" | "danger";

export interface TagProps extends VariantProps<typeof tagVariants> {
  children: ReactNode;
  onRemove?: (e: MouseEvent<HTMLButtonElement>) => void;
  tone?: TagTone;
  className?: string;
}

export function Tag({
  children,
  onRemove,
  tone = "neutral",
  className,
}: TagProps) {
  return (
    <span className={tagVariants({ tone, className })}>
      {/* `inline-flex items-center` chứ không phải `<span>` TRẦN.
          Đây mới là gốc của lỗi chip rớt dòng, chủ dự án phải báo ba lần: `<span>` trần không có
          layout nào, nên khi children là icon (SVG) + chữ thì SVG và chữ xếp thành HAI TẦNG — và
          `whitespace-nowrap` không cứu được, vì đó không phải chữ xuống dòng.
          Hai lượt vá trước đặt `flex-nowrap` ở lớp bọc ngoài và ở chính `Tag`, cả hai đều không
          chạm tới lớp này. */}
      <span className="inline-flex min-w-0 items-center gap-1.5">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove tag"
          className="inline-flex items-center justify-center p-0.5 -mr-1 rounded-md text-ink-3 hover:text-ink hover:bg-stroke-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 transition-colors cursor-pointer"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </span>
  );
}
