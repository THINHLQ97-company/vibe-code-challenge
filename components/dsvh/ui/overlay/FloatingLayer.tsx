"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

export interface FloatingLayerProps {
  /** Phần tử neo (trigger). Menu định vị theo rect của nó. */
  anchorRef: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  side?: Side;
  align?: Align;
  /** Khớp bề rộng menu = bề rộng trigger (dropdown Select/Combobox). */
  matchWidth?: boolean;
  /**
   * Cho phép LẬT sang phía đối diện khi phía yêu cầu không đủ chỗ. Mặc định `true` — giữ nguyên
   * hành vi cũ của mọi overlay đang dùng.
   *
   * Đặt `false` khi hướng mở là thứ người dùng ĐỌC ĐƯỢC và cần đoán trước: một hàng bộ lọc mà ô
   * này bung xuống, ô kia bung lên (chỉ vì số lựa chọn khác nhau) thì trông như hai thành phần
   * khác nhau. Lúc đó thay vì lật, panel GIỮ PHÍA và tự thu chiều cao vừa chỗ còn lại rồi cuộn
   * trong — không có lựa chọn nào bị mất, chỉ là phải cuộn.
   */
  flip?: boolean;
  gap?: number;
  className?: string;
  children: ReactNode;
  role?: string;
  /** Để trigger trỏ tới bằng `aria-describedby`/`aria-controls` — xem `Tooltip`. */
  id?: string;
}

/** Khoảng chừa tối thiểu với mép màn hình. */
const M = 8;

/** Hình chữ nhật của trigger — chỉ những trường phép tính cần, để gọi được ngoài trình duyệt. */
export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface ViTriNoi {
  top: number;
  left: number;
  /** Chỉ có khi `flip === false` và panel phải tự thu cho vừa chỗ. */
  maxH?: number;
}

/**
 * Phép tính đặt chỗ, TÁCH RA THUẦN để kiểm được.
 *
 * Nó phụ thuộc `getBoundingClientRect` + `window.innerHeight` + `useLayoutEffect` — cả ba đều không
 * chạy dưới `renderToStaticMarkup`, mà đó là thứ duy nhất bộ smoke có (workspace không có jsdom).
 * Để nguyên trong component nghĩa là nhánh khó nhất của tệp này KHÔNG có gì kiểm, trong khi đây là
 * nơi mọi overlay của hệ đi qua. Hàm này KHÔNG đổi hành vi — chỉ chuyển chỗ ở của cùng phép tính.
 */
export function tinhViTriNoi(
  r: AnchorRect,
  { pw, ph, vw, vh, side, align, gap, flip }: {
    pw: number; ph: number; vw: number; vh: number;
    side: Side; align: Align; gap: number; flip: boolean;
  }
): ViTriNoi {
  let top: number;
  let left: number;
  // Chỉ đặt khi `flip === false`: đó là lúc panel phải TỰ THU thay vì lật.
  let maxH: number | undefined;

  if (side === "top" || side === "bottom") {
    left =
      align === "start" ? r.left : align === "end" ? r.right - pw : r.left + r.width / 2 - pw / 2;
    const below = r.bottom + gap;
    const above = r.top - gap - ph;
    if (!flip) {
      // `Math.min(..., ph)`: khi CÒN đủ chỗ thì trần bằng đúng chiều cao tự nhiên (vốn đã bị
      // `max-h-*` của nơi gọi chặn), nên không có gì đổi so với trước. Chỉ khi thiếu chỗ nó mới
      // thật sự thu lại.
      if (side === "bottom") {
        top = below;
        maxH = Math.min(vh - M - below, ph);
      } else {
        top = Math.max(M, r.top - gap - ph);
        maxH = Math.min(r.top - gap - M, ph);
      }
    } else if (side === "bottom") top = below + ph > vh - M && above > M ? above : below;
    else top = above < M && below + ph <= vh - M ? below : above;
  } else {
    top =
      align === "start" ? r.top : align === "end" ? r.bottom - ph : r.top + r.height / 2 - ph / 2;
    const right = r.right + gap;
    const leftPos = r.left - gap - pw;
    if (side === "right") left = right + pw > vw - M && leftPos > M ? leftPos : right;
    else left = leftPos < M && right + pw <= vw - M ? right : leftPos;
  }

  left = Math.min(Math.max(M, left), vw - pw - M);
  // CHỈ kẹp theo `ph` khi được phép lật. Với `flip === false` mà panel cao hơn chỗ trống, phép kẹp
  // cũ sẽ kéo panel NGƯỢC LÊN cho vừa màn hình — tức là nó lại trùm lên chính cái nút vừa bấm, đúng
  // thứ mà việc tắt lật muốn tránh. Ở nhánh đó `maxH` mới là thứ giữ panel trong màn.
  top = maxH === undefined ? Math.min(Math.max(M, top), vh - ph - M) : Math.max(M, top);

  return maxH === undefined ? { top, left } : { top, left, maxH };
}

/**
 * SINGLE SOURCE cho mọi overlay nổi (Popover, Select, Combobox, menu…).
 * Render qua createPortal ra <body> với position:fixed tính từ getBoundingClientRect
 * của trigger, tự LẬT khi chạm mép/đáy và CLAMP vào viewport → không bao giờ bị
 * cắt bởi ancestor `overflow` (Modal, panel Shell) hay đè lên nội dung bên cạnh.
 * Tắt lật bằng `flip={false}` — khi đó panel giữ phía và tự thu chiều cao (xem prop đó).
 * Đóng khi: click ngoài (trừ trigger & panel), Esc, cuộn ngoài panel, resize.
 */
export function FloatingLayer({
  anchorRef,
  open,
  onClose,
  side = "bottom",
  align = "start",
  matchWidth = false,
  flip = true,
  gap = 6,
  className = "",
  children,
  role = "dialog",
  id,
}: FloatingLayerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({
    position: "fixed",
    top: 0,
    left: 0,
    visibility: "hidden",
  });

  useLayoutEffect(() => {
    if (!open) return;
    const compute = () => {
      const a = anchorRef.current;
      const p = panelRef.current;
      if (!a || !p) return;
      const r = a.getBoundingClientRect();
      const { top, left, maxH } = tinhViTriNoi(r, {
        pw: matchWidth ? r.width : p.offsetWidth,
        ph: p.offsetHeight,
        vw: window.innerWidth,
        vh: window.innerHeight,
        side,
        align,
        gap,
        flip,
      });
      setStyle({
        position: "fixed",
        top,
        left,
        ...(maxH !== undefined ? { maxHeight: maxH } : {}),
        ...(matchWidth ? { width: r.width } : {}),
        zIndex: 60,
        visibility: "visible",
      });
    };

    compute();
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener("resize", onClose);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onClose);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, side, align, matchWidth, flip, gap, anchorRef, onClose]);

  useLayoutEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div ref={panelRef} id={id} style={style} className={className} role={role}>
      {children}
    </div>,
    document.body
  );
}
