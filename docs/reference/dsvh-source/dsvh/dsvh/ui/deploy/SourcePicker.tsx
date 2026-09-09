"use client";

import type { ReactNode } from "react";
import { CheckCircleIcon } from "@/components/dsvh/icons";

/**
 * SourcePicker — lưới thẻ chọn NGUỒN deploy (GitHub / ZIP / URL git / Vercel /
 * Template / HTML editor…). Mỗi thẻ = icon + tên + mô tả; thẻ chọn viền cam + tick.
 */
export interface SourceOption {
  value: string;
  label: string;
  description?: string;
  icon: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface SourcePickerProps {
  options: SourceOption[];
  value: string | null;
  onChange: (value: string) => void;
  columns?: 2 | 3;
  className?: string;
}

export function SourcePicker({
  options,
  value,
  onChange,
  columns = 3,
  className = "",
}: SourcePickerProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
        columns === 3 ? "lg:grid-cols-3" : ""
      } ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            disabled={opt.disabled}
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            /* Hover đổi nền dùng `stroke-soft`, KHÔNG phải `surface-2`: `surface-2` (#fcfeff) chỉ
               hơn nền trắng 3/255 nên hover gần như không thấy gì — cùng token với hover hàng của
               `Table`, `AppCard` và `DBTypeCard`, để "một ô đang được trỏ tới" nhìn giống nhau ở
               mọi dạng danh sách. `rounded-card` cho khớp bậc bán kính THẺ (rounded-xl là bậc của
               nút/nav). */
            className={`group relative flex flex-col items-start gap-2.5 rounded-card border p-4 text-left transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 ${
              active
                ? "border-orange bg-orange/[0.06] ring-1 ring-orange/25"
                : "border-stroke bg-surface hover:border-stroke-hover hover:bg-stroke-soft"
            }`}
          >
            {active && (
              <span className="absolute right-3 top-3 text-orange">
                <CheckCircleIcon size={18} weight="fill" />
              </span>
            )}
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-lg transition-colors ${
                active ? "bg-orange/10 text-orange" : "bg-surface-2 text-ink-2"
              }`}
            >
              {opt.icon}
            </span>
            <span className="flex items-center gap-1.5 text-body font-semibold text-ink">
              {opt.label}
              {opt.badge}
            </span>
            {opt.description && (
              <span className="text-caption leading-snug text-ink-3">{opt.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
