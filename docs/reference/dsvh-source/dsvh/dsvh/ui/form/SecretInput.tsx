"use client";

import { useId, useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon, LockIcon } from "@/components/dsvh/icons";
import { CopyButton } from "@/components/dsvh/ui/CopyButton";

export interface SecretInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  hint?: string;
  error?: string;
  /** Hiện nút sao chép (mặc định true). */
  copyable?: boolean;
  /**
   * Mở sẵn giá trị thay vì che (mặc định `false` — che).
   *
   * Thêm 17/08/2026 cho ca "HIỆN ĐÚNG MỘT LẦN ĐỂ CHÉP LẠI": chuỗi bí mật TOTP lúc bật xác thực hai
   * lớp, khoá API vừa tạo, mật khẩu CSDL vừa cấp. Ở những chỗ đó người dùng đang PHẢI đọc và gõ lại
   * giá trị ngay lúc ấy, nên che đi rồi bắt bấm con mắt là thêm một bước vào đúng việc mà cả màn
   * hình sinh ra để làm.
   *
   * Vẫn giữ nút hiện/ẩn: mở sẵn không có nghĩa là không giấu được. Người dùng đang chia sẻ màn hình
   * cần tắt nó đi trong một nhịp.
   */
  defaultVisible?: boolean;
}

/**
 * Ô nhập giá trị BÍ MẬT — che (•••), nút hiện/ẩn, nút sao chép. Font mono cho
 * dễ đọc key/token. Dùng cho API key, connection string, biến môi trường mã hoá.
 * Chỉ semantic token → tự đổi theo theme.
 */
export function SecretInput({
  label,
  hint,
  error,
  copyable = true,
  defaultVisible = false,
  className = "",
  value,
  id,
  ...rest
}: SecretInputProps) {
  const genId = useId();
  const inputId = id || genId;
  const [visible, setVisible] = useState(defaultVisible);
  const val = typeof value === "string" ? value : "";

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-caption font-medium text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
          <LockIcon size={16} />
        </span>
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          aria-invalid={!!error}
          className={`h-9 w-full rounded-lg border bg-surface pl-9 ${
            copyable ? "pr-[4.5rem]" : "pr-10"
          } tabular-nums text-caption tracking-tight text-ink outline-none transition-colors placeholder:font-sans placeholder:text-ink-3 focus-visible:ring-2 focus-visible:ring-orange/30 ${
            error ? "border-orange" : "border-stroke hover:border-stroke-hover focus:border-orange"
          } ${className}`}
          {...rest}
        />
        <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ẩn giá trị" : "Hiện giá trị"}
            className="grid size-7 place-items-center rounded-md text-ink-3 transition-colors hover:bg-stroke-soft hover:text-ink-2"
          >
            {visible ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
          </button>
          {copyable && <CopyButton value={val} size="sm" />}
        </div>
      </div>
      {error ? (
        <p className="text-caption text-orange">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}
