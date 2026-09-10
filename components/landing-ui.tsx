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
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-9 sm:px-6">
      <p className="text-caption font-semibold uppercase tracking-wide text-orange-bright">
        {eyebrow}
      </p>
      <h2 className="mt-1.5 text-page font-bold tracking-tight text-cream">{title}</h2>
      <p className="mb-5 mt-1.5 max-w-3xl text-body text-cream/65">{subtitle}</p>
      {children}
    </section>
  );
}
