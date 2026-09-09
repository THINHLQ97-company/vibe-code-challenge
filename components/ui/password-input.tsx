"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Label } from "./label";

/**
 * Bản gọn của PasswordInput trong dsvh (docs/reference/dsvh-source/dsvh/dsvh/ui/auth/PasswordInput.tsx)
 * — bỏ phụ thuộc `tailwind-variants` + Phosphor icon set, dùng chữ "Hiện/Ẩn" thay icon
 * để không phải thêm dependency mới cho một nút bấm nhỏ.
 */
export interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
  error?: string;
}

export function PasswordInput({ label, hint, error, className, id, ...rest }: PasswordInputProps) {
  const genId = useId();
  const inputId = id || genId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <div className="relative">
        <Input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          className={cn("pr-14", className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-subtle hover:text-muted-foreground"
        >
          {visible ? "Ẩn" : "Hiện"}
        </button>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-sm text-subtle">{hint}</p>
      ) : null}
    </div>
  );
}
