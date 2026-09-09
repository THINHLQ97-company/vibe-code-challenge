"use client";

import { useTranslation } from "@/lib/i18n";
import { useCallback, useRef, useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/dsvh/icons";

export interface CopyButtonProps {
  /** Chuỗi được chép vào clipboard. */
  value: string;
  /** Có label → nút viền kèm chữ; không → nút icon gọn (đặt trong field). */
  label?: string;
  /** Chữ khi đã chép. Bỏ trống thì tra i18n `ds.copied`. */
  copiedLabel?: string;
  size?: "sm" | "md";
  className?: string;
  title?: string;
}

/**
 * Nút sao chép — hiện trạng thái "đã chép" thoáng qua (icon đổi + màu teal).
 * Dùng cho connection string, subdomain, API key, giá trị env… Chỉ semantic
 * token nên tự đổi theo light/dark.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
  size = "md",
  className = "",
  title,
}: CopyButtonProps) {
  const { t } = useTranslation();
  const copyTxt = t("ds.copy");
  const copiedTxt = copiedLabel ?? t("ds.copied");
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return; // clipboard bị chặn (không https / quyền) → bỏ qua êm
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1500);
  }, [value]);

  const Icon = copied ? CheckIcon : CopyIcon;
  const iconSize = size === "sm" ? 14 : 16;

  if (label !== undefined) {
    return (
      <button
        type="button"
        onClick={copy}
        title={title}
        aria-label={copied ? copiedTxt : label || copyTxt}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-stroke bg-surface px-2.5 py-1.5 text-caption font-medium transition-colors hover:border-stroke-hover hover:bg-stroke-soft active:scale-[0.97] ${
          copied ? "text-teal" : "text-ink-2"
        } ${className}`}
      >
        <Icon size={iconSize} />
        <span>{copied ? copiedTxt : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={title ?? (copied ? copiedTxt : copyTxt)}
      aria-label={copied ? copiedTxt : copyTxt}
      className={`grid ${size === "sm" ? "size-6" : "size-7"} place-items-center rounded-md transition-colors hover:bg-stroke-soft ${
        copied ? "text-teal" : "text-ink-3 hover:text-ink-2"
      } ${className}`}
    >
      <Icon size={iconSize} />
    </button>
  );
}
