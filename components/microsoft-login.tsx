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
 * LUÔN bấm được, kể cả khi chưa nối tenant. Bản trước làm nút mờ kèm một dòng giải thích "sẽ hoạt
 * động khi kết nối tenant" — nhìn như một tính năng hỏng, và dòng chú thích đó chiếm chỗ ngay dưới
 * lời kêu gọi hành động chính của trang. Chưa nối tenant thì bấm vào sẽ về trang đăng nhập kèm câu
 * báo rõ ràng, đủ để người dùng biết chuyện gì đang xảy ra mà không phải cảnh báo trước.
 *
 * `href` mặc định đi thẳng vào luồng đăng nhập Microsoft. Ở các trang giới thiệu thì truyền
 * `/login` để đưa người dùng tới trang đăng nhập trước, thay vì đẩy thẳng sang Microsoft.
 *
 * Không dùng `Button` của DSVH: nút đăng nhập của nhà cung cấp danh tính có quy ước hình thức
 * riêng (nền trắng, viền xám, logo bên trái) mà người dùng nhận ra ngay, đổi sang màu thương hiệu
 * của mình sẽ làm nó trông như một nút thường.
 */
export function MicrosoftLoginButton({
  href = "/api/auth/microsoft",
  size = "md",
  className = "",
}: {
  href?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const pad = size === "lg" ? "px-5 py-3 text-body" : "px-4 py-2.5 text-caption";
  return (
    <Link
      href={href}
      className={`inline-flex w-full items-center justify-center gap-2.5 rounded-lg border border-[#d1d1d1] bg-white font-medium text-[#3c3c3c] transition-colors hover:bg-[#f3f3f3] ${pad} ${className}`}
    >
      <MicrosoftMark size={size === "lg" ? 20 : 17} />
      Đăng nhập với Microsoft
    </Link>
  );
}
