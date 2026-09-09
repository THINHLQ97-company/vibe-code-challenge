"use client";

import Image from "next/image";
import { useState, type ImgHTMLAttributes } from "react";
import { type VariantProps } from "tailwind-variants";
import vhIcon from "@/assets/vh-icon.svg";
import { tv } from "../../tv";

/**
 * Ảnh đại diện.
 *
 * ── KHÔNG CÓ ẢNH ⇒ LOGO VIBE HOST, KHÔNG PHẢI CHỮ VIẾT TẮT (sửa 20/08/2026) ──────────────────
 *
 * Luật này KHÔNG mới: đã chốt 06/08/2026 — "logo là ảnh MẶC ĐỊNH; chỉ khi người dùng tự đổi thì
 * mới thay bằng ảnh của họ". Nhưng nó chỉ được áp cho NGƯỜI ĐANG ĐĂNG NHẬP, trong
 * `shared/user-avatar.tsx`, còn `Avatar` — thứ mọi bảng danh sách dùng — vẫn vẽ hai chữ cái.
 * Chính tệp đó ghi "đã ghi vào sổ `dsGaps`", nhưng sổ KHÔNG có mục nào như vậy; nên việc treo
 * lại 14 ngày và không ai thấy.
 *
 * Hậu quả chủ dự án bắt được ngày 20/08 ở /admin/staff: 110 tài khoản, phần lớn không ảnh, cột
 * đầu là một dãy chữ cái cam — và chúng TRÙNG NHAU ("Smoke Admin smoke-tokid" với "Smoke Admin
 * settings" đều ra "SS"). Hai chữ cái không phân biệt được người, nhưng lại trông y như một dấu
 * nhận diện, nên người đọc mất vài giây mới nhận ra nó chẳng nói gì.
 *
 * ── VÌ SAO PHẢI BỎ VIỀN VÀ NỀN KHI VẼ LOGO ──────────────────────────────────────────────────
 *
 * `vh-icon.svg` đã tự mang hình khối (squircle cam) và nền riêng. Bọc nó trong vỏ mặc định của
 * `Avatar` (`bg-surface-2` + `border`) là chồng hai lớp nền và viền một thứ vốn đã có viền —
 * đúng lý do `user-avatar.tsx` từng từ chối lồng logo vào đây. Nay `Avatar` tự bỏ hai lớp đó ở
 * nhánh logo, nên nơi gọi không cần biết chuyện này nữa.
 */

/** Lớp vỏ CHUNG cho mọi nhánh — cỡ và hình dạng, không màu nền. */
const avatarShell = tv({
  base: "relative inline-flex items-center justify-center shrink-0 overflow-hidden font-semibold select-none",
  variants: {
    size: {
      xs: "w-6 h-6 text-micro",
      sm: "w-8 h-8 text-caption",
      md: "w-10 h-10 text-body",
      lg: "w-12 h-12 text-title",
      xl: "w-16 h-16 text-title",
    },
    shape: {
      circle: "rounded-full",
      square: "rounded-lg",
    },
  },
  defaultVariants: {
    size: "md",
    shape: "circle",
  },
});

/**
 * Giữ tên cũ `avatarVariants` cho nơi nào đang import: vỏ chung + nền/viền của nhánh CÓ ẢNH.
 * Nhánh logo không dùng biến thể này (xem giải thích ở đầu tệp).
 */
export const avatarVariants = tv({
  extend: avatarShell,
  base: "bg-surface-2 text-orange border border-stroke-soft",
});

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "square";
/** `logo` = dấu Vibe Host (mặc định) · `initials` = hai chữ cái, chỉ dùng khi thật sự cần. */
export type AvatarFallback = "logo" | "initials";

export interface AvatarProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "size" | "src">,
    VariantProps<typeof avatarShell> {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  /**
   * Vẽ gì khi KHÔNG có ảnh. Mặc định `logo` theo luật chốt 06/08.
   *
   * `initials` còn đó cho ca hiếm mà việc phân biệt hai người quan trọng hơn việc nói "chưa đặt
   * ảnh" — nhưng cân nhắc kỹ: hai chữ cái trùng nhau rất dễ (đo được ở /admin/staff), nên nó
   * thường tạo cảm giác phân biệt được chứ không phân biệt thật.
   */
  fallback?: AvatarFallback;
  className?: string;
}

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = "md",
  shape = "circle",
  fallback = "logo",
  className,
  alt,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src) && !hasError;
  const veLogo = !showImage && fallback === "logo";

  return (
    <div
      className={veLogo ? avatarShell({ size, shape, className }) : avatarVariants({ size, shape, className })}
      title={name}
      aria-label={name}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src ?? undefined}
          alt={alt || name}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
          {...props}
        />
      ) : veLogo ? (
        /* `aria-hidden`: danh tính đã nằm ở `aria-label` của vỏ ngoài. Để logo tự đọc tên nữa thì
           trình đọc màn hình phát hai lần cho một người. */
        <Image src={vhIcon} alt="" aria-hidden className="h-full w-full object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
