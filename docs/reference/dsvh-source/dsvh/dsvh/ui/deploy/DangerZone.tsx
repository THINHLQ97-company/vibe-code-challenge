"use client";

import { useState } from "react";
import { Button } from "@/components/dsvh/ui/Button";
import { ConfirmDialog } from "@/components/dsvh/ui/overlay/ConfirmDialog";

export interface DangerAction {
  title: string;
  description: string;
  buttonLabel: string;
  confirmTitle: string;
  confirmDescription?: string;
  /** Bật xác nhận-gõ-tay (vd gõ tên app). */
  confirmText?: string;
  onConfirm: () => void;
}

export interface DangerZoneProps {
  title?: string;
  actions: DangerAction[];
}

/**
 * Vùng nguy hiểm (settings app): card viền đỏ nhạt liệt kê các hành động phá huỷ
 * (xoá app, reset DB…), mỗi hành động mở [ConfirmDialog] tone danger. Chỉ
 * semantic token, theme-aware.
 */
export function DangerZone({ title = "Danger Zone", actions }: DangerZoneProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="overflow-hidden rounded-card border border-red/30">
      <div className="border-b border-red/20 bg-red/[0.05] px-4 py-2.5 text-caption font-semibold uppercase tracking-wide text-red">
        {title}
      </div>
      <div className="divide-y divide-stroke-soft">
        {actions.map((a, i) => (
          <div
            key={a.title}
            className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-body font-semibold text-ink">{a.title}</p>
              <p className="mt-0.5 text-caption text-ink-3">{a.description}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setOpenIdx(i)}
              className="shrink-0 border-red/40 text-red hover:border-red hover:bg-red/[0.06] hover:text-red"
            >
              {a.buttonLabel}
            </Button>

            <ConfirmDialog
              open={openIdx === i}
              onClose={() => setOpenIdx(null)}
              onConfirm={() => {
                a.onConfirm();
                setOpenIdx(null);
              }}
              tone="danger"
              title={a.confirmTitle}
              description={a.confirmDescription}
              confirmText={a.confirmText}
              confirmLabel={a.buttonLabel}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
