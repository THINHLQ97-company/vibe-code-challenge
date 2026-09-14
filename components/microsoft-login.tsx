import Link from "next/link";

/** Dấu bốn ô của Microsoft, vẽ tay theo đúng bốn màu thương hiệu. */
export function MicrosoftMark({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="8" height="8" fill="#F25022" />
      <rect x="11" y="1" width="8" height="8" fill="#7FBA00" />
      <rect x="1" y="11" width="8" height="8" fill="#00A4EF" />
      <rect x="11" y="11" width="8" height="8" fill="#FFB900" />
    </svg>
  );
}

/**
 * Nút đăng nhập Microsoft.
 *
 * LUÔN hiện, kể cả khi chưa nối tenant — để giao diện đã sẵn sàng và ngày nối xong là chạy ngay,
 * không phải sửa gì thêm. Nhưng khi chưa nối thì nút KHÔNG bấm được và nói rõ lý do: một nút bấm
 * vào chỉ để nhận thông báo lỗi còn tệ hơn một nút mờ có giải thích.
 *
 * Không dùng `Button` của DSVH: nút đăng nhập của nhà cung cấp danh tính có quy ước hình thức
 * riêng (nền trắng, viền xám, logo bên trái) mà người dùng nhận ra ngay, đổi sang màu thương hiệu
 * của mình sẽ làm nó trông như một nút thường.
 */
export function MicrosoftLoginButton({
  ready,
  size = "md",
  className = "",
}: {
  ready: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const pad = size === "lg" ? "px-5 py-3 text-body" : "px-4 py-2.5 text-caption";
  const base = `inline-flex w-full items-center justify-center gap-2.5 rounded-lg border font-medium transition-colors ${pad}`;

  if (!ready) {
    return (
      <div className={className}>
        <span
          aria-disabled="true"
          className={`${base} cursor-not-allowed border-[#d1d1d1] bg-white/70 text-[#5e5e5e]`}
        >
          <MicrosoftMark size={size === "lg" ? 20 : 17} />
          Đăng nhập với Microsoft
        </span>
        <p className="mt-1.5 text-center text-meta text-ink-3">
          Sẽ hoạt động ngay khi ban tổ chức kết nối tenant Microsoft của công ty.
        </p>
      </div>
    );
  }

  return (
    <Link
      href="/api/auth/microsoft"
      className={`${base} border-[#d1d1d1] bg-white text-[#3c3c3c] hover:bg-[#f3f3f3] ${className}`}
    >
      <MicrosoftMark size={size === "lg" ? 20 : 17} />
      Đăng nhập với Microsoft
    </Link>
  );
}
