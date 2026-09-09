"use client";

import { useEffect, type ReactNode } from "react";
import { CloseIcon } from "@/components/dsvh/icons";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: ReactNode;
  children?: ReactNode;
  width?: string;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  width = "w-80 sm:w-96",
}: DrawerProps) {
  // Lock body scroll và lắng nghe phím ESC
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClasses =
    side === "left"
      ? "left-0 border-r animate-in slide-in-from-left duration-200"
      : "right-0 border-l animate-in slide-in-from-right duration-200";

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 bottom-0 ${sideClasses} ${width} max-w-[calc(100vw-2rem)] z-10 flex flex-col bg-surface p-6 shadow-2xl border-stroke-soft overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-stroke-soft">
          {title ? (
            <h2 className="text-title font-semibold text-ink leading-6">{title}</h2>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-2 hover:bg-stroke-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 transition-colors"
            aria-label="Close drawer"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="py-4 flex-1 text-body text-ink leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
