"use client";

import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from "react";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Nhãn cho trình đọc màn hình khi thanh trượt không có nhãn nhìn thấy được kề bên. */
  "aria-label"?: string;
  /** id của phần tử đang làm nhãn (vd `<span id="cpu">CPU</span>` ở hàng trên). */
  "aria-labelledby"?: string;
  /** Chuỗi đọc thay cho số thô, vd "0.3 core" thay vì "3". */
  "aria-valuetext"?: string;
  className?: string;
  id?: string;
}

/**
 * Thanh trượt chọn một giá trị số. Kéo bằng chuột/chạm, hoặc dùng bàn phím
 * (←/→/↑/↓ một bước · PageUp/PageDown mười bước · Home/End về hai đầu).
 *
 * BA THỨ QUYẾT ĐỊNH "KÉO CÓ MƯỢT KHÔNG" — cả ba từng sai ở bản trước:
 *
 * 1. **Bắt sự kiện ở phần tử BAO NGOÀI, không phải ở riêng thanh nền.** Nút tròn nằm
 *    ĐÈ LÊN thanh nền nhưng là phần tử ANH EM của nó, không phải con. Bản trước gắn
 *    `onPointerDown` vào thanh nền, nên bấm trúng ngay giữa nút tròn thì sự kiện rơi
 *    vào nút tròn, không nổi bọt sang thanh nền được → **không kéo được**. Người dùng
 *    phải bấm lệch ra khỏi nút mới kéo, đúng cảm giác "rít, khó kéo". Nay handler nằm
 *    ở gốc — cả nút tròn lẫn thanh nền đều là con nên bấm đâu cũng kéo được.
 *
 * 2. **`setPointerCapture` ở gốc + `onPointerMove` của React**, thay cho việc bắt
 *    `pointermove` trên `window`. Capture giữ cho mọi sự kiện di chuyển tiếp tục chảy
 *    về đúng phần tử này kể cả khi con trỏ ra ngoài cửa sổ, và tự nhả khi nhấc tay —
 *    không cần tự gỡ listener, nên cũng không rò khi component unmount giữa lúc kéo
 *    (bản trước gắn vào `window` mà không dọn ở unmount, và không xử lý `pointercancel`
 *    nên trình duyệt huỷ thao tác là listener kẹt lại).
 *
 * 3. **KHÔNG transition bề rộng phần tô trong lúc kéo.** Bản trước để
 *    `transition-all duration-75` cố định: nút tròn bám con trỏ tức thì còn vệt cam
 *    luôn về sau 75ms, nhìn ra thành cao su co giãn. Nay chỉ bật transition khi KHÔNG
 *    kéo (để bước bàn phím và thay đổi từ ngoài vẫn mượt), lúc kéo thì tắt hẳn.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className = "",
  id,
  ...aria
}: SliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  const updateValueFromPointer = useCallback(
    (clientX: number) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width === 0) return;

      const rawPercent = (clientX - rect.left) / rect.width;
      const clampedPercent = Math.max(0, Math.min(1, rawPercent));
      const rawVal = min + clampedPercent * (max - min);

      const steps = Math.round((rawVal - min) / step);
      const newValue = Math.max(min, Math.min(max, min + steps * step));

      const precision = (step.toString().split(".")[1] || "").length;
      const roundedVal = Number(newValue.toFixed(precision));

      if (roundedVal !== value) onChange(roundedVal);
    },
    [disabled, min, max, step, value, onChange]
  );

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    rootRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    // `preventDefault` chặn luôn việc trình duyệt tự focus, mà bấm xong người dùng
    // thường muốn tinh chỉnh tiếp bằng phím mũi tên → tự đưa focus về nút tròn.
    thumbRef.current?.focus();
    updateValueFromPointer(e.clientX);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateValueFromPointer(e.clientX);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    rootRef.current?.releasePointerCapture?.(e.pointerId);
    setDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;

    let newValue = clampedValue;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        newValue = clampedValue - step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        newValue = clampedValue + step;
        break;
      case "PageDown":
        e.preventDefault();
        newValue = clampedValue - step * 10;
        break;
      case "PageUp":
        e.preventDefault();
        newValue = clampedValue + step * 10;
        break;
      case "Home":
        e.preventDefault();
        newValue = min;
        break;
      case "End":
        e.preventDefault();
        newValue = max;
        break;
      default:
        return;
    }

    const precision = (step.toString().split(".")[1] || "").length;
    const clampedNewVal = Number(
      Math.max(min, Math.min(max, newValue)).toFixed(precision)
    );

    if (clampedNewVal !== value) onChange(clampedNewVal);
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`relative flex w-full touch-none select-none items-center py-2 ${
        disabled ? "cursor-not-allowed" : dragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
    >
      <div
        ref={trackRef}
        className="relative h-2 w-full overflow-hidden rounded-full bg-stroke-soft"
      >
        {/* Vô hiệu hoá thì phần tô về XÁM ĐẶC chứ không phải cam-mờ: cam dù nhạt vẫn đọc
            ra là "đang hoạt động, đây là giá trị của bạn"; xám mới nói được "không đổi
            được". Vẫn thấy được giá trị hiện tại, chỉ khác ở chỗ nó không mời gọi. */}
        <div
          className={`h-full ${disabled ? "bg-stroke-strong" : "bg-orange"} ${
            dragging ? "" : "transition-[width] duration-150 ease-out"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div
        ref={thumbRef}
        id={id}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuenow={clampedValue}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-orientation="horizontal"
        aria-disabled={disabled}
        onKeyDown={handleKeyDown}
        {...aria}
        className={`absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 ${
          disabled
            ? "border-stroke-strong bg-surface-2"
            : `border-orange bg-surface ${dragging ? "scale-110" : "hover:scale-110"}`
        } ${dragging ? "" : "transition-[transform,left] duration-150 ease-out"}`}
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
