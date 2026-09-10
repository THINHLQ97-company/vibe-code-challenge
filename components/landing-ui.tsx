import type { ReactNode } from "react";

/**
 * Bộ mảnh giao diện cho TRANG GIỚI THIỆU — nền tối toàn trang.
 *
 * KHÔNG dùng `Card`/`Note`/`Badge` của DSVH ở đây: bộ đó dựng cho nền `surface` sáng (viền
 * `stroke`, chữ `ink`), đặt lên nền `canvas` tối là viền biến mất và chữ tối trên nền tối — đúng
 * lỗi vô hình app này đã mất công đi sửa một lần. Trang giới thiệu là mặt tiếp thị nền tối, nên
 * nó có bộ riêng; MỌI màn trong /dashboard và /admin vẫn dùng DSVH như cũ.
 *
 * Chữ trên nền tối dùng token `cream` (không đảo theo theme), đúng luật INVERTPAIR.
 */

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-cream/12 bg-cream/[0.045] backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent";
}) {
  const cls =
    tone === "accent"
      ? "border-orange/40 bg-orange/12 text-orange-bright"
      : "border-cream/15 bg-cream/[0.06] text-cream/70";
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-meta font-medium ${cls}`}>
      {children}
    </span>
  );
}

export function DarkNote({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warning" }) {
  const cls =
    tone === "warning"
      ? "border-amber/35 bg-amber/10 text-cream/80"
      : "border-cream/12 bg-cream/[0.04] text-cream/65";
  return <p className={`rounded-lg border px-3.5 py-2.5 text-caption ${cls}`}>{children}</p>;
}

/**
 * Khung một mục nội dung.
 *
 * Bề ngang `max-w-6xl` chứ không `5xl`: ở màn 1440–1920 thì cột 1024px để lại hai dải trống rất
 * rộng, làm khoảng cách dọc trông thừa thãi theo. Đệm dọc cũng hạ từ ~104px xuống 72px.
 */
export function Band({
  id,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  /** Neo cho menu trang chủ. `scroll-mt` chừa chỗ cho thanh đầu dính. */
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-20 px-5 py-9 sm:px-6">
      <p className="text-caption font-semibold uppercase tracking-wide text-orange-bright">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 text-page font-bold tracking-tight text-cream">{title}</h2>
      <p className="mb-5 mt-1.5 max-w-3xl text-body text-cream/65">{subtitle}</p>
      {children}
    </section>
  );
}

/**
 * Ô CHỜ ẢNH MINH HOẠ.
 *
 * Hiện khung gạch đứt kèm ĐÚNG kích thước cần và mô tả ảnh phải chụp gì. Khi ảnh về, thả file vào
 * `public/huong-dan/` rồi truyền `src` — không phải sửa bố cục. Cố ý KHÔNG dùng ảnh mẫu tạm: một
 * tấm ảnh giả trông như đã xong sẽ lặng lẽ đi thẳng lên bản chạy thật.
 */
export function ImageSlot({
  src,
  alt,
  ratio = "16/9",
  note,
}: {
  src?: string;
  alt: string;
  ratio?: string;
  /** Mô tả ảnh cần chụp — chỉ bắt buộc khi CHƯA có `src`. */
  note?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className="w-full rounded-card border border-cream/12"
        style={{ aspectRatio: ratio, objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className="flex flex-col items-center justify-center gap-1.5 rounded-card border border-dashed border-cream/25 bg-cream/[0.03] p-6 text-center"
      style={{ aspectRatio: ratio }}
    >
      <span className="text-caption font-semibold text-cream/60">Chỗ đặt ảnh minh hoạ</span>
      <span className="max-w-md text-meta text-cream/45">{note}</span>
      <span className="mt-1 rounded-full border border-cream/15 px-2 py-0.5 text-micro text-cream/40">
        tỉ lệ {ratio}
      </span>
    </div>
  );
}

/**
 * Nút trở về đầu trang.
 *
 * Là một thẻ `<a href="#top">` chứ không phải nút chạy JavaScript: cuộn tới neo là hành vi sẵn có
 * của trình duyệt, chạy cả khi JS chưa tải, và người dùng bàn phím tab tới được như mọi liên kết.
 * Trang này dài hơn 5000px nên nút luôn hiện, không cần bắt sự kiện cuộn để ẩn/hiện.
 */
export function BackToTop() {
  return (
    <a
      href="#top"
      aria-label="Trở về đầu trang"
      className="fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-full border border-cream/20 bg-canvas/85 text-cream/80 backdrop-blur-md transition-colors hover:border-orange/50 hover:bg-orange/15 hover:text-orange-bright"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19.5V5.5" />
        <path d="M5.8 11.7L12 5.5l6.2 6.2" />
      </svg>
    </a>
  );
}
