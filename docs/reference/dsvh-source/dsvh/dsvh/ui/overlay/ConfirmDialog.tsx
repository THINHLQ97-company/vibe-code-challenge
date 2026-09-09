"use client";

import { type ReactNode, useState } from "react";
import { Modal } from "@/components/dsvh/ui/overlay/Modal";
import { Button } from "@/components/dsvh/ui/Button";
import { WarningIcon } from "@/components/dsvh/icons";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  /**
   * Xác nhận-gõ-tay: người dùng phải gõ đúng chuỗi này thì nút xác nhận mới bật
   * (kiểu "type the app name to delete"). Bỏ trống = không yêu cầu gõ.
   */
  confirmText?: string;
}

/**
 * Hộp xác nhận hành động — dựng trên [Modal] (KHÔNG tạo overlay thứ 2). Tone
 * `danger` cho hành động phá huỷ (nút đỏ + icon cảnh báo); `confirmText` bật chế
 * độ gõ-tên-để-xác-nhận. Chỉ semantic token, theme-aware.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Huỷ",
  tone = "default",
  loading = false,
  confirmText,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");
  const isDanger = tone === "danger";
  const needsType = Boolean(confirmText);
  const canConfirm = (!needsType || typed === confirmText) && !loading;

  const close = () => {
    setTyped("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      size="md"
      tone={isDanger ? "error" : "default"}
      icon={isDanger ? <WarningIcon width={18} height={18} /> : undefined}
      title={title}
      description={description}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={close} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={isDanger ? "solid" : "dark"}
            loading={loading}
            disabled={!canConfirm}
            onClick={onConfirm}
            className={
              isDanger
                ? "bg-red text-white hover:bg-red-strong hover:opacity-100"
                : undefined
            }
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      {needsType && (
        <div className="flex flex-col gap-1.5">
          <label className="text-caption text-ink-2">
            Gõ{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 tabular-nums text-caption font-semibold text-ink">
              {confirmText}
            </code>{" "}
            để xác nhận
          </label>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            spellCheck={false}
            aria-label="Nhập để xác nhận"
            className="h-10 w-full rounded-lg border border-stroke bg-surface px-3 tabular-nums text-body text-ink outline-none transition-colors focus:border-stroke-focus"
          />
        </div>
      )}
    </Modal>
  );
}
