import type { ComponentType } from "react";
import {
  InfoIcon,
  CheckCircleIcon,
  WarningIcon,
  ErrorIcon,
} from "@/components/dsvh/icons";

/**
 * SINGLE SOURCE OF TRUTH cho status/tone toàn hệ (Badge, Modal, Alert, Toast...).
 * Color language: info = neutral · success = teal · warning = amber · error = red.
 */
export type Status = "info" | "success" | "warning" | "error";

type IconLike = ComponentType<{ size?: number; className?: string }>;

export interface StatusStyle {
  Icon: IconLike;
  icon: string;
  softPill: string;
  softContainer: string;
  softTitle: string;
  softBody: string;
  loudContainer: string;
  loudIcon: string;
  loudTitle: string;
  loudBody: string;
}

export const statusStyles: Record<Status, StatusStyle> = {
  info: {
    Icon: InfoIcon,
    icon: "text-ink-2",
    softPill: "bg-stroke-soft text-ink-2",
    softContainer: "bg-surface-2 border-stroke",
    softTitle: "text-ink",
    softBody: "text-ink-2",
    /**
     * CÙNG BỆNH VỚI TOOLTIP (sửa 13/08/2026): nền `bg-ink` đảo theo theme, chữ `text-white` thì
     * không. Ở theme tối nền thành `#eef1f2` mà chữ vẫn trắng → 1.14:1, băng thông báo trắng trơn.
     * `surface` là cặp đối xứng nên đảo cùng nhịp (17.53:1 sáng · 15.10:1 tối).
     * Thân dùng `/85` thay vì màu nhạt hơn: phân cấp ở đây do ĐỘ MỜ lo, và 0.85 trên nền tương phản
     * 15:1 vẫn còn dư địa rộng — khác ca `error` nơi nền đỏ đã sát ngưỡng nên phải bỏ alpha.
     */
    loudContainer: "bg-ink border-ink",
    loudIcon: "text-surface",
    loudTitle: "text-surface",
    loudBody: "text-surface/85",
  },
  success: {
    Icon: CheckCircleIcon,
    icon: "text-teal",
    /* `teal-strong` ở theme SÁNG, lùi về `teal` ở theme tối — cùng khuôn `amber-strong` đã dùng
       ở `SubdomainInput`. Đo 20/08 bằng `ds:probe`: `text-teal` trên `bg-teal/12` chỉ đạt 2.69:1,
       badge "Thành công"/"Hoạt động" gần như chìm vào nền của chính nó. Bậc đậm đo được 4.82:1.
       Theme tối thì nền `bg-teal/12` nằm trên nền tối nên `teal` gốc vẫn nổi — không đổi. */
    softPill: "bg-teal/12 text-teal-strong dark:text-teal",
    softContainer: "bg-teal/10 border-teal/30",
    softTitle: "text-ink",
    softBody: "text-ink-2",
    loudContainer: "bg-teal border-teal",
    loudIcon: "text-white",
    loudTitle: "text-white",
    loudBody: "text-white/90",
  },
  warning: {
    Icon: WarningIcon,
    icon: "text-amber-strong",
    softPill: "bg-amber/15 text-amber-strong",
    softContainer: "bg-amber/15 border-amber/40",
    softTitle: "text-ink",
    softBody: "text-ink-2",
    loudContainer: "bg-amber border-amber-strong",
    loudIcon: "text-ink",
    loudTitle: "text-ink",
    loudBody: "text-ink/80",
  },
  error: {
    Icon: ErrorIcon,
    icon: "text-red",
    softPill: "bg-red/12 text-red",
    softContainer: "bg-red/15 border-red/50",
    softTitle: "text-ink",
    softBody: "text-ink-2",
    /**
     * CHỮ TRẮNG, không phải chữ vàng (sửa 11/08/2026).
     *
     * Đo bằng cách rasterise pixel thật ở khối cảnh báo của `/admin/nodes/[id]`: vàng
     * `rgb(255,200,76)` trên đỏ `rgb(217,45,32)` cho tương phản **3.13:1**, dưới ngưỡng WCAG AA
     * 4.5:1 cho chữ 14px. Trắng trên cùng nền ấy cho **4.83:1**.
     *
     * `error` cũng là tone LOUD DUY NHẤT dùng màu chữ riêng — `info` và `success` đều dùng trắng,
     * `warning` dùng `text-ink` trên nền vàng. Tức đây là một ngoại lệ lẻ chứ không phải một quyết
     * định hệ thống, và nó làm chính khối quan trọng nhất của app khó đọc nhất.
     *
     * Thân dùng `text-white` NGUYÊN, không phải `text-white/90` như `success`: alpha 0.9 trên nền
     * đỏ này tụt xuống 4.14:1 — vẫn trượt ngưỡng. Phân cấp tiêu đề/thân do ĐỘ ĐẬM lo, không do độ
     * mờ; giảm độ mờ để tạo cấp bậc là cách âm thầm phá tương phản.
     */
    loudContainer: "bg-red border-red-strong",
    loudIcon: "text-white",
    loudTitle: "text-white",
    loudBody: "text-white",
  },
};

/** Tone nào render "loud" (solid) mặc định trong banner. */
export const defaultLoud: Record<Status, boolean> = {
  info: false,
  success: false,
  warning: false,
  error: true,
};
