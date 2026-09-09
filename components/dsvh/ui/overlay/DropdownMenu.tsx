"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { CheckIcon } from "@/components/dsvh/icons";
import { FloatingLayer } from "./FloatingLayer";

/**
 * DropdownMenu — menu ngữ cảnh chuẩn (icon, phím tắt, mục danger, separator, mục CHỌN ĐƯỢC).
 * Dựng trên FloatingLayer (portal + né mép) → không bị overflow cắt.
 */
export type MenuItem =
  | { separator: true }
  | {
      label: string;
      icon?: ReactNode;
      onSelect?: () => void;
      danger?: boolean;
      disabled?: boolean;
      shortcut?: string;
      /**
       * Có mặt = mục này thuộc một nhóm CHỌN MỘT (chọn giao diện, chọn ngôn ngữ, sắp xếp theo…).
       *
       * Khai `selected` đổi luôn ngữ nghĩa trợ năng của mục: `menuitem` → `menuitemradio` kèm
       * `aria-checked`. Đây là khác biệt người dùng trình đọc màn hình nghe được — `menuitem` chỉ
       * nói "có một việc bấm được", `menuitemradio` nói "một trong mấy lựa chọn, và cái này đang
       * được chọn". Bỏ trống khi mục là một HÀNH ĐỘNG (Xoá, Làm mới), vì lúc đó không có gì để chọn.
       *
       * Chỗ đánh dấu LUÔN chiếm chỗ kể cả khi không được chọn: để trống rồi mới chèn dấu vào lúc
       * chọn sẽ đẩy nhãn dịch ngang mỗi lần đổi lựa chọn.
       */
      selected?: boolean;
    };

export interface DropdownMenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  side = "bottom",
  align = "end",
  className = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="inline-block">
      <div
        ref={anchorRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer"
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
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
        role="menu"
        className={`min-w-[10rem] overflow-hidden rounded-xl border border-stroke bg-surface p-1 shadow-lg animate-in fade-in zoom-in-95 ${className}`}
      >
        {items.map((it, i) =>
          "separator" in it ? (
            <div key={i} className="my-1 h-px bg-stroke-soft" role="separator" />
          ) : (
            <button
              key={i}
              type="button"
              role={it.selected === undefined ? "menuitem" : "menuitemradio"}
              aria-checked={it.selected === undefined ? undefined : it.selected}
              disabled={it.disabled}
              onClick={() => {
                it.onSelect?.();
                setOpen(false);
              }}
              /* NỀN xám chỉ nói "con trỏ đang ở đây", KHÔNG nói "đang chọn" — cùng luật với
                 `form/Select`. Bản đầu tôi tô nền cho mục đang chọn, mà đó đúng bằng màu hover, nên
                 mục đang chọn và mục đang rê chuột nhìn y hệt nhau. Đang chọn = CHỮ CAM + tick cam. */
              className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-40 ${
                it.danger
                  ? "text-red hover:bg-red/10"
                  : "text-ink-2 hover:bg-stroke-soft hover:text-ink"
              }`}
            >
              {/* Bọc icon để nó ăn màu cam theo nhãn khi đang chọn — icon Phosphor vẽ bằng
                  `currentColor` nên chỉ cần đặt màu ở lớp cha. Chỉ dựng lớp bọc KHI CÓ icon, vì
                  một span rỗng vẫn ăn `gap-2.5` và đẩy nhãn thụt vào ở những mục không icon. */}
              {it.icon && (
                <span className={`flex shrink-0 items-center ${it.selected ? "text-orange" : ""}`}>
                  {it.icon}
                </span>
              )}
              <span className={`flex-1 text-left ${it.selected ? "text-orange" : ""}`}>
                {it.label}
              </span>
              {it.shortcut && (
                <kbd className="shrink-0 tabular-nums text-meta text-ink-3">{it.shortcut}</kbd>
              )}
              {it.selected !== undefined && (
                <CheckIcon
                  size={16}
                  aria-hidden
                  className={`shrink-0 text-orange ${it.selected ? "" : "invisible"}`}
                />
              )}
            </button>
          )
        )}
      </FloatingLayer>
    </div>
  );
}
