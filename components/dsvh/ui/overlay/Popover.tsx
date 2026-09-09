"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { FloatingLayer } from "./FloatingLayer";

export interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function Popover({
  trigger,
  children,
  side = "bottom",
  align = "start",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="inline-block">
      <div
        ref={anchorRef}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        {trigger}
      </div>

      <FloatingLayer
        anchorRef={anchorRef}
        open={open}
        onClose={close}
        side={side}
        align={align}
        role="dialog"
        className="min-w-[8rem] max-w-xs rounded-xl border border-stroke bg-surface shadow-lg animate-in fade-in zoom-in-95"
      >
        {children}
      </FloatingLayer>
    </div>
  );
}
