import { forwardRef } from "react";
import { type VariantProps } from "tailwind-variants";
import { tv } from "../tv";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputField = tv({
  base: "w-full rounded-lg border bg-surface text-ink outline-none transition-colors placeholder:text-ink-3 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:opacity-60",
  variants: {
    size: {
      sm: "h-8 px-2.5 text-caption",
      md: "h-9 px-3 text-body",
      lg: "h-11 px-4 text-body",
    },
    invalid: {
      true: "border-orange focus:ring-2 focus:ring-orange/20",
      false: "border-stroke hover:border-stroke-hover focus:border-stroke-focus focus:ring-2 focus:ring-orange/15",
    },
    hasLeft: { true: "", false: "" },
    hasRight: { true: "", false: "" },
  },
  compoundVariants: [
    { hasLeft: true, size: "sm", class: "pl-8" },
    { hasLeft: true, size: "md", class: "pl-9" },
    { hasLeft: true, size: "lg", class: "pl-11" },
    { hasRight: true, size: "sm", class: "pr-8" },
    { hasRight: true, size: "md", class: "pr-9" },
    { hasRight: true, size: "lg", class: "pr-11" },
  ],
  defaultVariants: { size: "md", invalid: false },
});

type FieldSize = "sm" | "md" | "lg";

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  Pick<VariantProps<typeof inputField>, never> & {
    label?: string;
    hint?: string;
    error?: string;
    size?: FieldSize;
    leftIcon?: ReactNode;
    /**
     * Khối nằm ĐÈ lên mép phải trong lòng ô: nút hiện/ẩn mật khẩu, nút sao chép, đơn vị đo…
     *
     * Có `leftIcon` từ đầu mà thiếu vế phải là lý do 5 chỗ trong app phải tự dựng `<div relative>`
     * riêng rồi truyền `className="pr-9"` — mà `className` đi vào DIV GỐC chứ không vào `<input>`,
     * nên nó đệm cái bọc ngoài và ĐẨY Ô NHẬP đi, để lại nút nằm ngoài ô. Đó chính là lỗi icon rơi
     * khỏi trường ở màn đăng nhập (11/08).
     *
     * KHÁC `leftIcon` ở chỗ KHÔNG có `pointer-events-none`: vế phải hầu như luôn bấm được.
     */
    rightSlot?: ReactNode;
  };

/**
 * `forwardRef` để nơi gọi chạm được vào chính `<input>`.
 *
 * Không phải tiện tay: có những việc CHỈ làm được qua ref — đưa con trỏ vào ô sau khi báo lỗi
 * (`focus()`), chọn hết nội dung, cuộn ô vào tầm nhìn. Trước bản này DSVH không cho, nên màn
 * /deploy phải mượn `ui/input` của shadcn chỉ vì cần `ref` cho ô tên website (bắt được 06/08).
 * Ref trỏ vào `<input>`, KHÔNG phải div bọc ngoài — cái người gọi cần là ô nhập.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({
  label,
  hint,
  error,
  size = "md",
  leftIcon,
  rightSlot,
  className,
  id,
  ...props
}, ref) {
  const invalid = !!error;
  return (
    // `className` gắn vào ROOT (div bọc ngoài), không phải `<input>` bên trong — root mới là phần tử
    //
    // HỆ QUẢ PHẢI BIẾT: lớp ĐỆM và CHIỀU CAO truyền qua `className` sẽ tác động lên cái BỌC, không
    // lên ô nhập. Chín chỗ trong app từng viết `className="h-11 pl-9"` từ thời `className` còn đi
    // thẳng vào `<input>`; sau khi đổi, chúng đệm cái bọc và đẩy ô nhập sang phải, để icon rơi hẳn
    // ra ngoài trường (màn đăng nhập, 11/08). Dùng `size` cho chiều cao, `leftIcon`/`rightSlot` cho
    // icon — gate FIELDCLS chặn việc truyền lớp đệm/chiều cao qua `className`.
    // thật sự tham gia layout khi Input nằm trong flex/grid (vd `min-w-[250px]` của ô tìm ở
    // `ListSearch`). Dùng `cn()` (twMerge) thay vì nối chuỗi thường — `w-full` có sẵn trong base PHẢI
    // bị `w-auto`/`flex-1` truyền vào đè được; nối chuỗi thường không đảm bảo thắng-thua theo thứ tự
    // xuất hiện, mà theo thứ tự trong stylesheet đã biên dịch (bắt được thật ở `Select` cùng khuôn —
    // `flex-none` không đè nổi `w-full` gốc, field tự nhận đủ 100% bề rộng hàng).
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={id} className="text-caption font-medium text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={invalid}
          className={inputField({ size, invalid, hasLeft: !!leftIcon, hasRight: !!rightSlot })}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center text-ink-3">
            {rightSlot}
          </span>
        )}
      </div>
      {error ? (
        <p className="text-caption text-orange">{error}</p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
})
