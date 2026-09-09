"use client";

import { type VariantProps } from "tailwind-variants";
import { tv } from "../../tv";
import {
  useRef,
  useEffect,
  type TextareaHTMLAttributes,
  type ChangeEvent,
} from "react";
import { cn } from "@/lib/utils";

export const textareaVariants = tv({
  base: "w-full rounded-lg border bg-surface text-ink text-body outline-none transition-colors placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-orange/30 resize-y",
  variants: {
    size: {
      sm: "px-2.5 py-1.5 text-caption min-h-[64px]",
      md: "px-3 py-2 text-body min-h-[88px]",
      lg: "px-4 py-2.5 text-body min-h-[112px]",
    },
    invalid: {
      true: "border-orange focus:border-orange",
      false: "border-stroke hover:border-stroke-soft focus:border-orange",
    },
  },
  defaultVariants: {
    size: "md",
    invalid: false,
  },
});

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Pick<VariantProps<typeof textareaVariants>, never> {
  label?: string;
  hint?: string;
  error?: string;
  size?: TextareaSize;
  autoGrow?: boolean;
}

export function Textarea({
  label,
  hint,
  error,
  size = "md",
  autoGrow = false,
  className = "",
  id,
  value,
  onChange,
  rows = 3,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const invalid = !!error;

  const adjustHeight = (el: HTMLTextAreaElement) => {
    if (!autoGrow) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (autoGrow && textareaRef.current) {
      adjustHeight(textareaRef.current);
    }
  }, [value, autoGrow]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (autoGrow) {
      adjustHeight(e.target);
    }
    onChange?.(e);
  };

  return (
    // `className` gắn vào ROOT (div bọc ngoài) — cùng lý do đã sửa ở `Input.tsx`/`Select.tsx`: root
    // mới là phần tử tham gia layout flex/grid của nơi gọi, không phải `<textarea>` bên trong. Dùng
    // `cn()` (twMerge) chứ không nối chuỗi thường — cùng lý do: `w-full` gốc phải bị đè được đúng.
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-caption font-medium text-ink-2">
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleChange}
        rows={rows}
        aria-invalid={invalid}
        className={textareaVariants({
          size,
          invalid,
        })}
        {...props}
      />
      {error ? (
        <p className="text-caption text-orange">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
