import type { ReactNode } from "react";
import { LogoWide, LogoWideDark } from "@/components/brand";
import { RocketIcon, DatabaseIcon, TrophyIcon } from "@/components/dsvh/icons";

/**
 * Khung màn xác thực hai cột — theo bố cục màn đăng nhập Vibe Host.
 *
 * Trái: ảnh nền tràn viền, logo bản tối ở góc trên, ba thẻ điểm nhấn ở đáy. Chỉ hiện từ `lg` trở
 * lên; dưới ngưỡng đó cột ảnh biến mất hoàn toàn và form chiếm cả màn — trên điện thoại một nửa
 * màn hình dành cho ảnh trang trí là lấy mất chỗ của thứ người ta mở trang ra để làm.
 *
 * Ảnh nền đặt bằng `background-image` chứ không phải thẻ `<img>`: BTC chưa gửi ảnh nên file có thể
 * chưa tồn tại, và khi đó `background-image` hỏng lặng lẽ để lộ lớp gradient bên dưới — vẫn đẹp.
 * Một thẻ `<img>` 404 thì hiện icon ảnh vỡ.
 */
const HIGHLIGHTS = [
  {
    icon: <RocketIcon size={18} />,
    title: "Tự dựng trong kỳ thi",
    desc: "Vibe code cùng AI, không dùng lại repo có sẵn",
  },
  {
    icon: <DatabaseIcon size={18} />,
    title: "Database chạy thật",
    desc: "Sản phẩm đọc ghi dữ liệu thật, không gắn cứng",
  },
  {
    icon: <TrophyIcon size={18} />,
    title: "Đậu là có quyền lợi",
    desc: "Hoàn phí AI qua lương + 110% Năng lực AI",
  },
];

export function AuthSplit({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="relative hidden w-1/2 shrink-0 overflow-hidden bg-canvas lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/auth-bg.jpg)" }}
        />
        {/* Lớp phủ để chữ và thẻ luôn đọc được dù ảnh nền sáng hay tối. */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/55 to-canvas/70" />

        <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
          <LogoWideDark height={40} />

          <div>
            <h2 className="max-w-md text-page font-bold leading-tight text-cream">
              Tự tay làm ra một sản phẩm và đưa lên Vibe Host
            </h2>
            <p className="mt-2 max-w-md text-body text-cream/70">
              Hiểu sản phẩm từ bên trong để tư vấn, bán và hỗ trợ khách tốt hơn.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {HIGHLIGHTS.map((h) => (
                <div
                  key={h.title}
                  className="rounded-card border border-cream/15 bg-canvas/50 p-3 backdrop-blur-sm"
                >
                  <span className="grid size-8 place-items-center rounded-lg bg-cream/10 text-cream">
                    {h.icon}
                  </span>
                  <div className="mt-2.5 text-caption font-semibold text-cream">{h.title}</div>
                  <div className="mt-0.5 text-meta text-cream/60">{h.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          {/* Dưới `lg` không có cột ảnh nên logo phải xuất hiện ở đây, bản sáng cho nền `surface`. */}
          <div className="mb-7 lg:hidden">
            <LogoWide height={34} />
          </div>

          <h1 className="text-page font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-body text-ink-2">{subtitle}</p>

          <div className="mt-6">{children}</div>

          {footer && <div className="mt-6 text-center text-caption text-ink-2">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
