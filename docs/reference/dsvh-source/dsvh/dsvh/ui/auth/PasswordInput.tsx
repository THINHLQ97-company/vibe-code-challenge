"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "../../tv";
import { EyeIcon, EyeSlashIcon, LockIcon } from "@/components/dsvh/icons";

/**
 * Scale chiều cao PHẢI khớp với `Input` (xem ui/Input.tsx) — 2 field đứng cạnh
 * nhau trên cùng 1 form (vd Email + Mật khẩu) mà lệch size là bug: nhìn thấy rõ
 * (44px vs 36px). Mặc định "md" giữ nguyên hành vi cũ (không phá chỗ đang dùng).
 */
const passwordField = tv({
  base: "w-full rounded-lg border bg-surface text-ink outline-none transition-colors placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-orange/30",
  variants: {
    size: {
      sm: "h-8 pl-8 pr-9 text-caption",
      md: "h-9 pl-9 pr-10 text-body",
      lg: "h-11 pl-11 pr-12 text-body",
    },
    invalid: {
      true: "border-orange",
      false: "border-stroke hover:border-stroke-hover focus:border-orange",
    },
  },
  defaultVariants: { size: "md", invalid: false },
});

const toggleBtn = tv({
  base: "absolute top-1/2 -translate-y-1/2 grid place-items-center rounded-md text-ink-3 transition-colors hover:bg-stroke-soft hover:text-ink-2",
  variants: {
    size: {
      // Touch target lớn dần theo size field — lg đạt ~36px, gần mốc khuyến nghị
      // 44px (WCAG 2.5.5) mà vẫn vừa trong field 44px không tràn viền.
      sm: "right-1 size-6",
      md: "right-1.5 size-7",
      lg: "right-2 size-9",
    },
  },
  defaultVariants: { size: "md" },
});

type FieldSize = "sm" | "md" | "lg";
const iconSize: Record<FieldSize, number> = { sm: 14, md: 16, lg: 18 };

function scorePassword(pw: string): number {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}
const STRENGTH = [
  { label: "Rất yếu", bar: "bg-red", text: "text-red" },
  { label: "Yếu", bar: "bg-red", text: "text-red" },
  { label: "Trung bình", bar: "bg-amber", text: "text-amber-strong" },
  { label: "Khá", bar: "bg-teal", text: "text-teal" },
  { label: "Mạnh", bar: "bg-teal", text: "text-teal" },
];

export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">,
    VariantProps<typeof passwordField> {
  label?: string;
  hint?: string;
  error?: string;
  /** Hiện thanh đo độ mạnh (khi đặt mật khẩu mới). */
  showStrength?: boolean;
}

export function PasswordInput({
  label,
  hint,
  error,
  showStrength = false,
  size = "md",
  className = "",
  value,
  id,
  ...rest
}: PasswordInputProps) {
  const genId = useId();
  const inputId = id || genId;
  const [visible, setVisible] = useState(false);
  const pw = typeof value === "string" ? value : "";
  const score = scorePassword(pw);
  const fieldSize = size ?? "md";

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-caption font-medium text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
          <LockIcon size={iconSize[fieldSize]} />
        </span>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          aria-invalid={!!error}
          className={passwordField({ size, invalid: !!error, className })}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className={toggleBtn({ size })}
        >
          {visible ? <EyeSlashIcon size={iconSize[fieldSize]} /> : <EyeIcon size={iconSize[fieldSize]} />}
        </button>
      </div>

      {showStrength && pw.length > 0 && (
        <div className="mt-0.5 flex flex-col gap-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < score ? STRENGTH[score].bar : "bg-stroke-soft"
                }`}
              />
            ))}
          </div>
          <span className={`text-caption ${STRENGTH[score].text}`}>{STRENGTH[score].label}</span>
        </div>
      )}

      {error ? (
        <p className="text-caption text-orange">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
