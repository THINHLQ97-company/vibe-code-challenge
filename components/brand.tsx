import Image from "next/image";

/**
 * Logo cuộc thi. Hai bản, dùng ở hai loại nền khác nhau — KHÔNG thay thế cho nhau được.
 *
 * Bản NGANG có chữ tô `#111111`: chỉ dùng trên nền sáng (`surface`). Đặt lên cột điều hướng nền
 * `canvas` (tối ở cả hai theme) là chữ đen trên nền đen — đúng loại lỗi vô hình mà app này vừa
 * mất công đi sửa.
 *
 * Bản NGANG TỐI có chữ `#F2F2F2`: dùng trên nền `canvas` — cột điều hướng dùng bản này, đọc được
 * cả tên cuộc thi thay vì chỉ một khối vuông.
 *
 * Bản VUÔNG tự mang nền kem `#FDECE5` nên nổi trên mọi nền — để dành cho chỗ HẸP (thanh đầu ở
 * mobile) nơi logo ngang không đủ chỗ.
 *
 * Màu logo (`#F5451B`) lệch token `orange` (#de4400) của DSVH: đây là tài sản thương hiệu, thuộc
 * ngoại lệ đã khai trong docs/design.md, không sửa cho khớp token.
 *
 * Dùng `next/image` với `unoptimized` thay vì `<img>`: bộ tối ưu ảnh không xử lý SVG, còn `<img>`
 * thô thì vướng luật lint của Next.
 */
const WIDE_RATIO = 945 / 281;
const WIDE_DARK_RATIO = 945 / 261;

export function LogoWide({ height = 30, className = "" }: { height?: number; className?: string }) {
  return (
    <Image
      src="/logo-wide.svg"
      alt="Vibe Code Challenge"
      width={Math.round(height * WIDE_RATIO)}
      height={height}
      priority
      unoptimized
      className={className}
    />
  );
}

/** Bản ngang chữ sáng (`#F2F2F2`) — dành riêng cho nền tối `canvas`. */
export function LogoWideDark({
  height = 26,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-wide-dark.svg"
      alt="Vibe Code Challenge"
      width={Math.round(height * WIDE_DARK_RATIO)}
      height={height}
      priority
      unoptimized
      className={className}
    />
  );
}

export function LogoSquare({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-square.svg"
      alt="Vibe Code Challenge"
      width={size}
      height={size}
      priority
      unoptimized
      className={className}
    />
  );
}
