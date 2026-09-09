"use client";

import type { ReactNode } from "react";

/**
 * SegmentedControl — chọn 1 trong vài mục ngắn (view switch, filter, chọn nhanh).
 * Mục active nổi lên (bg-surface + shadow) trên rãnh surface-2. Generic theo value.
 */
export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-lg border border-stroke bg-surface-2 p-1 ${
        fullWidth ? "flex w-full" : ""
      } ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={opt.disabled}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 ${
              fullWidth ? "flex-1" : ""
            } ${size === "sm" ? "h-7 px-2.5 text-caption" : "h-8 px-3 text-caption"} ${
              active
                ? "bg-surface text-ink shadow-sm"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
