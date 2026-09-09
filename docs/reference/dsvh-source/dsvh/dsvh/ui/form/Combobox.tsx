"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { ChevronDownIcon, CheckIcon, SearchIcon } from "@/components/dsvh/icons";
import { FloatingLayer } from "@/components/dsvh/ui/overlay/FloatingLayer";

export interface ComboboxOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps<T = string> {
  value: T | null;
  onChange: (value: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** CÙNG thang với `Input`/`Select` — ba thứ hay đứng chung một hàng lọc, lệch một nấc là thấy ngay. */
  size?: "sm" | "md" | "lg";
  className?: string;
  id?: string;
}

/**
 * Thang cỡ dùng CHUNG với `Input` (`inputField`) và `Select` (`selectTrigger`). Trước đây Combobox
 * ghim cứng `h-10` và không có prop `size`, nên trong một hàng lọc "ô tìm + combobox + select" nó cao
 * hơn hai cái kia đúng 4px — bắt được ở `/templates`: hai select trông như bị tụt xuống so với ô tìm.
 * Sửa ở đây chứ không chỉnh riêng ở trang: lệch cỡ giữa các control cùng họ là lỗi hệ, không phải lỗi
 * bố cục của một màn.
 */
const COMBOBOX_SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9 px-3 text-[14px]",
  lg: "h-11 px-4 text-[15px]",
};

export function Combobox<T = string>({
  value,
  onChange,
  options,
  placeholder = "Chọn một tùy chọn...",
  emptyText = "Không tìm thấy kết quả",
  disabled = false,
  size = "md",
  className = "",
  id,
}: ComboboxProps<T>) {
  const generatedId = useId();
  const comboboxId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const raf = requestAnimationFrame(() => {
      setSearchQuery("");
      setFocusedIndex(0);
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let next = prev + 1;
        while (next < filteredOptions.length && filteredOptions[next]?.disabled) {
          next++;
        }
        return next < filteredOptions.length ? next : prev;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        let next = prev - 1;
        while (next >= 0 && filteredOptions[next]?.disabled) {
          next--;
        }
        return next >= 0 ? next : prev;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        const opt = filteredOptions[focusedIndex];
        if (opt && !opt.disabled) {
          onChange(opt.value);
          setIsOpen(false);
          triggerRef.current?.focus();
        }
      }
    }
  };

  const handleSelect = (opt: ComboboxOption<T>) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        id={comboboxId}
        type="button"
        disabled={disabled}
        onKeyDown={handleKeyDown}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-stroke bg-surface text-ink transition-colors select-none ${COMBOBOX_SIZE[size]} ${
          disabled
            ? "cursor-not-allowed bg-surface-2 text-ink-3 opacity-60"
            : "cursor-pointer hover:bg-stroke-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
        }`}
      >
        <span className={`truncate ${selectedOption ? "text-ink" : "text-ink-3"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          size={16}
          className={`shrink-0 text-ink-3 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-orange" : ""
          }`}
        />
      </button>

      <FloatingLayer
        anchorRef={triggerRef}
        open={isOpen}
        onClose={close}
        matchWidth
        role="listbox"
        className="rounded-xl border border-stroke bg-surface p-1.5 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95"
      >
        <div onKeyDown={handleKeyDown}>
          <div className="relative mb-1.5 flex items-center border-b border-stroke-soft px-2.5 pb-1.5 pt-0.5">
            <SearchIcon size={16} className="shrink-0 text-ink-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setFocusedIndex(0);
              }}
              placeholder="Tìm kiếm..."
              className="ml-2 w-full bg-transparent text-[13px] text-ink placeholder:text-ink-3 outline-none"
            />
          </div>

          <div className="max-h-56 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2.5 text-center text-[13px] text-ink-3">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isFocused = index === focusedIndex;

                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => !opt.disabled && setFocusedIndex(index)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-[13px] transition-colors select-none ${
                      opt.disabled
                        ? "cursor-not-allowed text-ink-3 opacity-50"
                        : isFocused
                        ? "cursor-pointer bg-stroke-soft text-ink"
                        : "cursor-pointer text-ink hover:bg-stroke-soft"
                    }`}
                  >
                    <span className={isSelected ? "font-medium text-orange" : ""}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <CheckIcon size={16} className="shrink-0 text-orange" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </FloatingLayer>
    </div>
  );
}
