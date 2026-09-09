"use client";

import type { ReactNode } from "react";
import { CloseIcon } from "@/components/dsvh/icons";
import { statusStyles, defaultLoud, type Status } from "@/components/dsvh/status";

export interface AlertProps {
  tone?: Status;
  title?: ReactNode;
  children?: ReactNode;
  /** override the default treatment (error is loud/solid, others soft) */
  variant?: "soft" | "loud";
  onClose?: () => void;
}

export function Alert({ tone = "info", title, children, variant, onClose }: AlertProps) {
  const s = statusStyles[tone] ?? statusStyles.info;
  const loud = variant ? variant === "loud" : defaultLoud[tone];

  const container = loud ? s.loudContainer : s.softContainer;
  const iconColor = loud ? s.loudIcon : s.icon;
  const titleColor = loud ? s.loudTitle : s.softTitle;
  const bodyColor = loud ? s.loudBody : s.softBody;
  const { Icon } = s;

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border p-4 transition-all ${container}`}
      role="alert"
    >
      <div className={`mt-0.5 shrink-0 ${iconColor}`}>
        <Icon size={20} />
      </div>

      <div className="flex-1 text-body">
        {title && (
          <h4 className={`font-semibold leading-5 ${titleColor}`}>{title}</h4>
        )}
        {children && (
          <div className={`${title ? "mt-1" : ""} leading-relaxed ${bodyColor}`}>
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className={`shrink-0 rounded-lg p-1 opacity-70 transition-opacity hover:bg-black/10 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/30 ${iconColor}`}
          aria-label="Close alert"
        >
          <CloseIcon size={16} />
        </button>
      )}
    </div>
  );
}
