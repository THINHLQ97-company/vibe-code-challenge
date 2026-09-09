"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { tv } from "../../tv";
import { ChevronDownIcon, CheckIcon } from "@/components/dsvh/icons";
import { FloatingLayer } from "@/components/dsvh/ui/overlay/FloatingLayer";
import { cn } from "@/lib/utils";

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps<T = string> {
  label?: string;
  /**
   * Giữ nhãn cho trình đọc màn hình nhưng KHÔNG vẽ ra (thêm 20/08/2026).
   *
   * Dành cho hàng "một ô chọn + một nút" nằm dưới một tiêu đề đã nói rõ việc — ở đó nhãn
   * vẽ ra là câu thứ ba lặp lại điều mà chỗ trống (`placeholder`) và chữ trên nút đã nói.
   * Bỏ hẳn `label` thì gọn mắt nhưng ô chọn mất tên gọi khi đọc bằng bàn phím/trình đọc,
   * nên cách đúng là ẩn phần nhìn, giữ phần nghe.
   */
  labelHidden?: boolean;
  value?: T | null;
  onChange?: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  size?: SelectSize;
  error?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /**
   * Cho phép menu LẬT lên trên khi thiếu chỗ bên dưới. Mặc định `true` (hành vi cũ).
   *
   * Đặt `false` cho các ô nằm CHUNG MỘT HÀNG LỌC: chiều mở khi đó không còn phụ thuộc số lựa chọn
   * của từng ô, nên cả hàng mở cùng một hướng. Xem `FloatingLayer.flip`.
   */
  flip?: boolean;
}

export const selectTriggerVariants = tv({
  base: "group flex w-full items-center justify-between gap-2 rounded-lg border bg-surface text-ink outline-none transition-colors disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-orange/30 select-none cursor-pointer",
  variants: {
    size: {
      sm: "h-8 px-2.5 text-caption",
      md: "h-9 px-3 text-body",
      lg: "h-11 px-4 text-body",
    },
    invalid: {
      true: "border-orange focus:border-orange",
      false: "border-stroke hover:border-stroke-soft focus:border-orange",
    },
  },
  defaultVariants: {
    size: "md",
    invalid: false,
  },
});

export function Select<T = string>({
  label,
  labelHidden = false,
  value,
  onChange,
  options,
  placeholder = "Chọn một tùy chọn...",
  size = "md",
  error,
  disabled = false,
  className = "",
  id,
  flip = true,
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const close = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev + 1;
          while (next < options.length && options[next]?.disabled) {
            next++;
          }
          return next < options.length ? next : prev;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          let next = prev - 1;
          while (next >= 0 && options[next]?.disabled) {
            next--;
          }
          return next >= 0 ? next : prev;
        });
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          const targetOpt = options[focusedIndex];
          if (targetOpt && !targetOpt.disabled) {
            onChange?.(targetOpt.value);
            setIsOpen(false);
            buttonRef.current?.focus();
          }
        }
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, options, onChange]);

  const toggleOpen = () => {
    if (disabled) return;
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      const idx = options.findIndex((opt) => opt.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  };

  const handleSelect = (opt: SelectOption<T>) => {
    if (opt.disabled) return;
    onChange?.(opt.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    // `className` gắn vào ROOT (div bọc ngoài) — cùng lý do đã sửa ở `Input.tsx`: root mới là phần tử
    // thật sự tham gia layout flex/grid của nơi gọi (vd `min-w-[190px]` ở bộ lọc `tab-websites.tsx`),
    // không phải `<button>` trigger bên trong. Dùng `cn()` (twMerge) chứ không nối chuỗi thường: `w-full`
    // có sẵn trong base PHẢI bị class ngoài đè được (vd `w-auto`/`shrink` khi Select là 1 trong nhiều
    // field trên cùng hàng flex) — nối chuỗi thường không đảm bảo thắng-thua theo thứ tự xuất hiện,
    // mà theo thứ tự trong stylesheet đã biên dịch. Bắt được thật ở bộ lọc `admin-deployments`:
    // `flex-none` truyền vào không đè nổi `w-full` gốc, field tự nhận đủ 100% bề rộng hàng.
    <div className={cn("flex w-full flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className={labelHidden ? "sr-only" : "text-caption font-medium text-ink-2"}
        >
          {label}
        </label>
      )}
      <div className="relative w-full">
        <button
          ref={buttonRef}
          id={selectId}
          type="button"
          disabled={disabled}
          onClick={toggleOpen}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          className={selectTriggerVariants({
            size,
            invalid: !!error,
          })}
        >
          <span className={`truncate ${selectedOption ? "text-ink" : "text-ink-3"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            size={16}
            className={`shrink-0 text-ink-3 transition-transform duration-200 ${isOpen ? "rotate-180 text-orange" : ""}`}
          />
        </button>

        <FloatingLayer
          anchorRef={buttonRef}
          open={isOpen}
          onClose={close}
          matchWidth
          flip={flip}
          role="listbox"
          className="max-h-60 overflow-auto rounded-xl border border-stroke bg-surface p-1 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95"
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-caption text-ink-3">Không có dữ liệu</div>
          ) : (
            options.map((opt, index) => {
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
                  className={`flex select-none items-center justify-between rounded-lg px-3 py-2 text-caption transition-colors ${
                    opt.disabled
                      ? "cursor-not-allowed text-ink-3 opacity-50"
                      : isFocused
                        ? "cursor-pointer bg-stroke-soft text-ink"
                        : "cursor-pointer text-ink hover:bg-stroke-soft"
                  }`}
                >
                  <span className={isSelected ? "font-medium text-orange" : ""}>{opt.label}</span>
                  {isSelected && <CheckIcon size={16} className="shrink-0 text-orange" />}
                </div>
              );
            })
          )}
        </FloatingLayer>
      </div>
      {error ? <p className="text-caption text-orange-strong dark:text-orange">{error}</p> : null}
    </div>
  );
}
