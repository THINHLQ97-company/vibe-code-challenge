"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

/**
 * PinInput / OTP — nhập mã xác thực (đặt lại mật khẩu, 2FA). Controlled: `value`
 * (chuỗi số), `onChange`. Tự nhảy ô, backspace lùi ô, dán full-code.
 */
export interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  error?: boolean;
  onComplete?: (value: string) => void;
}

export function PinInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  error = false,
  onComplete,
}: PinInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.split("").slice(0, length);

  const setAt = (i: number, ch: string) => {
    const next = value.split("");
    next[i] = ch;
    const joined = next.join("").slice(0, length);
    onChange(joined);
    if (ch && joined.length === length && !joined.includes("")) onComplete?.(joined);
  };

  const handleChange = (i: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setAt(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[i]) {
        setAt(i, "");
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
        setAt(i - 1, "");
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    onChange(digits);
    const focusIdx = Math.min(digits.length, length - 1);
    refs.current[focusIdx]?.focus();
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <div className="flex gap-2" role="group" aria-label="Mã xác thực">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={chars[i] ?? ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          aria-label={`Ký tự ${i + 1}`}
          className={`size-11 rounded-lg border bg-surface text-center text-title font-semibold text-ink outline-none transition-colors focus-visible:ring-2 focus-visible:ring-orange/30 disabled:opacity-60 ${
            error ? "border-red" : "border-stroke hover:border-stroke-hover focus:border-orange"
          }`}
        />
      ))}
    </div>
  );
}
