"use client";

import { useId, type ReactNode } from "react";
import { tv } from "../../tv";

export type SwitchSize = "sm" | "md" | "lg";

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: SwitchSize;
  /** Nhãn ngoài track (bên phải nút) — cách dùng gốc, không đổi. */
  label?: ReactNode;
  /**
   * Nhãn NGẮN (≤ 2 từ, vd "Đang bật"/"Tạm tắt", "Bật"/"Tắt") hiện NGAY TRONG track thay vì một
   * `label` đứng ngoài — dùng khi cần tiết kiệm chiều ngang (bảng nhiều dòng trạng thái, mỗi hàng
   * đã đủ chật). Có cặp `onLabel`/`offLabel` thì `label` ngoài bị bỏ qua. Track tự giãn theo `size`
   * (rộng hơn bản không-chữ) và giữ NGUYÊN một bề rộng cho cả hai trạng thái — đổi bật/tắt không đổi
   * layout xung quanh. CHỈ hợp với nhãn ngắn: chữ dài hơn 2 từ sẽ tràn hoặc bị cắt.
   */
  onLabel?: string;
  offLabel?: string;
  className?: string;
  id?: string;
  name?: string;
}

export const switchTrackVariants = tv({
  base: "relative inline-flex items-center shrink-0 cursor-pointer rounded-full border border-stroke transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    size: {
      sm: "h-5 w-9 p-0.5",
      md: "h-6 w-11 p-0.5",
      lg: "h-7.5 w-14 p-1",
    },
    checked: {
      // OFF trước đây `bg-surface-2` (#fcfeff) trên nền Card `bg-surface` (#ffffff) — chênh 3/255,
      // gần như vô hình, chỉ còn viền mảnh `border-stroke` gánh hết (bắt được thật ở `/backups`: nút
      // "Tắt" nhìn như mất tích). Đổi sang `bg-stroke-soft` (#eef2f2) — cùng token nền xám nhạt mà
      // Badge tone="neutral" đã dùng và ĐÃ rõ nét trên `bg-surface` (badge "Thủ công" cùng trang).
      /* `orange-strong`: track BẬT mang chữ trắng ("Bật"/"Đang bật"), và trắng trên `#de4400`
         đo được 4.26:1 — trượt AA. Cùng lý do với nút chính và Badge accent. */
      true: "bg-orange-strong border-orange-strong",
      false: "bg-stroke-soft hover:bg-stroke-hover",
    },
  },
  defaultVariants: {
    size: "md",
    checked: false,
  },
});

/**
 * Track khi có `onLabel`/`offLabel` — rộng hơn bản trơn để chứa chữ, MỘT bề rộng cho cả hai trạng
 * thái (đổi bật/tắt không đổi layout). `justify-between` + thứ tự phần tử con (nút tròn/chữ) đổi
 * theo `checked` ở component, nên không cần `translate-x` như bản trơn.
 *
 * Bề rộng đo SÁT cho nhãn 1 TỪ ngắn (vd "Bật"/"Tắt") — đúng ca thật đã dùng (trước đo theo
 * "Đang bật"/"Tạm tắt" 2 từ thì dư khoảng trống nhìn không "gọn" như tên gọi của biến thể này).
 * Nhãn dài hơn 1 từ ngắn thì tự truyền `className="w-<n>"` để nới track — `tv()` merge qua
 * `className` sẵn có, không cần thêm prop riêng.
 *
 * MÀU OFF DÙNG CHUNG VỚI SWITCH TRƠN: `bg-stroke-soft` + `border-stroke` — đúng cặp token mà
 * `switchTrackVariants` đã dùng. Đây là RÀNG BUỘC hệ thống, không phải lựa chọn thẩm mỹ riêng của
 * biến thể này: cùng một trang có thể vừa có Switch trơn (trang cài đặt) vừa có Switch-có-chữ (cột
 * trạng thái trong bảng); hai thứ cùng nghĩa "đang tắt" mà một cái xám nhạt, một cái xám đậm thì đọc
 * ra như hai trạng thái khác nhau. Từng thử nền ĐẶC tối (`bg-ink-3`) cho riêng biến thể này vì lo
 * mảng rộng chìm trên nền trắng — sai hướng: cái gánh độ tương phản ở đây là **chữ tối + viền**, chứ
 * không phải nền. Nền tối chỉ khiến nó tự tách khỏi phần còn lại của hệ.
 *
 * Hệ quả: chữ trong track phải đổi màu theo trạng thái (ON nền cam → chữ trắng; OFF nền sáng → chữ
 * `text-ink-2`), xem `switchTextInTrackVariants`.
 *
 * KHE NÚT TRÒN PHẢI ĐỀU 4 PHÍA. Khe dọc KHÔNG do padding quyết định (nút cao cố định,
 * `items-center` tự canh giữa) mà = `border + (chiều-cao-trong − chiều-cao-nút)/2`; khe ngang mới
 * = `border + padding-x`. Trước đây md để nút `h-5` (20px) trong track `h-6` (24px, viền 1px) →
 * dọc chỉ 1+1=2px trong khi ngang là 1+4=5px — nút trông như bị dẹt sát mép trên/dưới. Nay cỡ nút
 * đo NGƯỢC từ khe mong muốn (`nút = cao-track − 2×khe`) và `padding-x = khe − border`, nên hai
 * con số bằng nhau ở mọi size: sm 2px, md 3px, lg 4px.
 */
export const switchTrackWithTextVariants = tv({
  base: "relative inline-flex items-center justify-between shrink-0 cursor-pointer rounded-full border transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange/30 disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    size: {
      // padding-x = khe mong muốn − border(1px) — xem ghi chú khe đều ở trên.
      sm: "h-5 w-12 px-px",
      md: "h-6 w-14 px-0.5",
      lg: "h-7.5 w-[70px] px-[3px]",
    },
    checked: {
      // Y HỆT `switchTrackVariants` — xem ghi chú "màu OFF dùng chung" ở trên.
      /* `orange-strong`: track BẬT mang chữ trắng ("Bật"/"Đang bật"), và trắng trên `#de4400`
         đo được 4.26:1 — trượt AA. Cùng lý do với nút chính và Badge accent. */
      true: "bg-orange-strong border-orange-strong",
      false: "bg-stroke-soft border-stroke hover:bg-stroke-hover",
    },
  },
  defaultVariants: {
    size: "md",
    checked: false,
  },
});

/** Nút tròn khi có chữ trong track — không `translate-x` (vị trí do `justify-between` + thứ tự
 *  phần tử con quyết định, không phải toạ độ tuyệt đối).
 *
 *  Cỡ nút = `cao-track − 2 × khe` để khe dọc bằng đúng khe ngang (`border + padding-x` của track):
 *  sm 20−2×2=16px · md 24−2×3=18px · lg 30−2×4=22px. Đổi cỡ nút thì phải đổi `px-*` của track theo,
 *  hai bên là một cặp. (Bản Switch trơn dùng cỡ nút khác — nó không có chữ nên cân đối khác.) */
export const switchThumbWithTextVariants = tv({
  base: "pointer-events-none shrink-0 rounded-full bg-surface shadow-sm",
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-4.5 w-4.5",
      lg: "h-5.5 w-5.5",
    },
  },
  defaultVariants: { size: "md" },
});

/** Chữ trong track — màu ĐỔI THEO nền: ON là `bg-orange` đặc nên chữ trắng; OFF là `bg-stroke-soft`
 *  sáng (dùng chung token với Switch trơn) nên chữ phải là `text-ink-2`. Ở trạng thái OFF chính chữ
 *  tối này mới là thứ gánh độ tương phản của cả nút, nền chỉ làm khối.
 *
 *  `px-*` riêng cho chữ: phía trong giữ chữ cách nút tròn, phía ngoài CỘNG thêm padding track nên
 *  chữ lùi sâu hơn khỏi đầu bo tròn (mép cong "ăn" vào chữ nếu chỉ dựa `px-*` của track — đúng lỗi
 *  "chữ sát shape cam" bắt được ở `/admin/templates`). */
export const switchTextInTrackVariants = tv({
  base: "select-none whitespace-nowrap font-medium leading-none",
  variants: {
    /* Dùng BẬC CÓ TÊN thay cho `text-[Npx]` (08/08). Ba con số này trùng khít ba bậc nhỏ nhất của
       thang — micro 10 · meta 11 · caption 12 — nên đổi tên gọi là ZERO-VISUAL, chỉ khác ở chỗ giờ
       chúng đi theo thang: ai chỉnh thang một lần là nhãn trong công tắc đổi theo, thay vì nằm lại
       ba con số cứng. Bắt được khi đo cỡ chữ toàn bộ bảng ngày 08/08: /admin/templates ra 11px lạc
       giữa 12/14 — truy ra không phải lỗi của bảng mà của chính công tắc trong ô. */
    /* Bậc `md` xuống MICRO (10px) ngày 08/08 — chủ dự án chốt. Nhãn trong công tắc là chữ nằm
       TRONG một điều khiển, không phải chữ của bảng; để nó ở 11px thì mọi bảng có công tắc lại mọc
       thêm một cỡ thứ tư (10/11/12/14) chỉ vì một nhãn hai chữ. Về 10px là thang trong bảng còn
       đúng ba bậc. `lg` cũng hạ một nấc theo cho ba bậc giữ nguyên khoảng cách. */
    size: {
      sm: "px-1 text-micro",
      md: "px-1.5 text-micro",
      lg: "px-2 text-meta",
    },
    checked: {
      true: "text-white",
      false: "text-ink-2",
    },
  },
  defaultVariants: {
    size: "md",
    checked: false,
  },
});

export const switchThumbVariants = tv({
  base: "pointer-events-none rounded-full bg-surface shadow-sm transition-transform duration-200 ease-in-out",
  variants: {
    size: {
      sm: "h-3.5 w-3.5",
      md: "h-5 w-5",
      lg: "h-5.5 w-5.5",
    },
    checked: {
      true: "",
      false: "translate-x-0",
    },
  },
  compoundVariants: [
    { size: "sm", checked: true, class: "translate-x-4" },
    { size: "md", checked: true, class: "translate-x-5" },
    { size: "lg", checked: true, class: "translate-x-[26px]" },
  ],
  defaultVariants: {
    size: "md",
    checked: false,
  },
});

export function Switch({
  checked = false,
  onChange,
  disabled = false,
  size = "md",
  label,
  onLabel,
  offLabel,
  className = "",
  id,
  name,
}: SwitchProps) {
  const generatedId = useId();
  const switchId = id || generatedId;
  const withText = Boolean(onLabel && offLabel);

  const toggle = () => {
    if (disabled) return;
    onChange?.(!checked);
  };

  if (withText) {
    const thumb = <span className={switchThumbWithTextVariants({ size })} />;
    const text = (
      <span className={switchTextInTrackVariants({ size, checked })}>
        {checked ? onLabel : offLabel}
      </span>
    );
    return (
      <button
        type="button"
        role="switch"
        id={switchId}
        name={name}
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={switchTrackWithTextVariants({ size, checked, className })}
      >
        {/* Nút tròn LUÔN ở cạnh vừa đi tới: tắt→trái (chữ nằm bên phải), bật→phải (chữ nằm bên
            trái) — cùng chiều đọc với bản có `translate-x`, chỉ khác cách dựng (thứ tự phần tử
            trong `justify-between`, không phải toạ độ). */}
        {checked ? (
          <>
            {text}
            {thumb}
          </>
        ) : (
          <>
            {thumb}
            {text}
          </>
        )}
      </button>
    );
  }

  return (
    <label
      htmlFor={switchId}
      className={`inline-flex select-none items-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    >
      <button
        type="button"
        role="switch"
        id={switchId}
        name={name}
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={switchTrackVariants({ size, checked, className: "" })}
      >
        <span className={switchThumbVariants({ size, checked })} />
      </button>
      {label && (
        <span className={`text-ink ${size === "sm" ? "text-caption" : size === "lg" ? "text-body" : "text-body"}`}>{label}</span>
      )}
    </label>
  );
}
