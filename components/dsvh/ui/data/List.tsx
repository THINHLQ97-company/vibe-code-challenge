import type { ReactNode, HTMLAttributes } from "react";
import { tv } from "../../tv";

/**
 * HAI BIẾN THỂ, CHỌN THEO NGỮ CẢNH CHỨ KHÔNG THEO THẨM MỸ (20/08/2026).
 *
 * Cùng lý do và cùng từ vựng `Empty` đã dùng: `block` tự mang khung để đứng một mình,
 * `inline` KHÔNG khung vì nó nằm sẵn trong một khối đã có khung (`Card`, tab). Đặt bản
 * `block` vào trong `Card` là hai đường viền lồng nhau — mắt đọc ra hai bề mặt cho một
 * nội dung, đúng lỗi vừa gỡ ở thẻ "Website sử dụng".
 *
 * `inline` chỉnh luôn hàng con bằng selector thay vì bắt nơi dùng gõ thêm class: bỏ đệm
 * ngang (để chữ thẳng hàng với tiêu đề thẻ và các trường bên trên — còn đệm là danh sách
 * bị thụt vào so với mọi thứ quanh nó) và bỏ nền riêng (nền của thẻ có thể không phải
 * `surface`). Vạch ngăn giữ nguyên: đó là thứ khiến nhiều dòng đọc ra một danh sách.
 */
export const listVariants = tv({
  base: "flex flex-col divide-y divide-stroke-soft",
  variants: {
    variant: {
      block: "overflow-hidden rounded-xl border border-stroke bg-surface",
      inline: "[&>*]:bg-transparent [&>*]:px-0",
    },
  },
  defaultVariants: {
    variant: "block",
  },
});

export interface ListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "block" | "inline";
  className?: string;
}

export function List({ children, variant, className, ...props }: ListProps) {
  return (
    <div role="list" className={listVariants({ variant, className })} {...props}>
      {children}
    </div>
  );
}

export const listItemVariants = tv({
  base: "flex items-center gap-3.5 px-4 py-3 bg-surface transition-colors",
  variants: {
    interactive: {
      true: "hover:bg-stroke-soft cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30",
      false: "",
    },
  },
  defaultVariants: {
    interactive: false,
  },
});

export interface ListItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  leading?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListItem({
  leading,
  title,
  description,
  trailing,
  onClick,
  className,
  ...props
}: ListItemProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? "button" : "listitem"}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={listItemVariants({ interactive: isInteractive, className })}
      {...props}
    >
      {leading && (
        <div className="shrink-0 flex items-center justify-center text-ink-2">
          {leading}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-body font-medium text-ink truncate">{title}</div>
        {description && (
          <div className="text-caption text-ink-3 mt-0.5 truncate">{description}</div>
        )}
      </div>
      {trailing && (
        <div className="shrink-0 flex items-center justify-center ml-auto text-ink-3">
          {trailing}
        </div>
      )}
    </div>
  );
}
