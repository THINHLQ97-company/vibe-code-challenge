import type { ReactNode } from "react";
import { LunorMark } from "@/components/dsvh/icons";

/**
 * AuthCard — khung căn giữa cho các màn xác thực (login/register/reset).
 * Nền canvas (tối, cả 2 theme), thẻ surface bên trong. Logo + tiêu đề nằm TRONG
 * thẻ để chữ dùng token ink (đọc tốt ở light lẫn dark).
 */
export interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  brand?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer, brand }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-stroke bg-surface p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            {brand ?? <LunorMark size={44} />}
            <h1 className="mt-4 text-page font-bold tracking-tight text-ink">{title}</h1>
            {subtitle && <p className="mt-1.5 text-body text-ink-2">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <div className="mt-5 text-center text-caption text-cream/70">{footer}</div>
        )}
      </div>
    </div>
  );
}
