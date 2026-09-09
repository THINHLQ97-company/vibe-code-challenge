import type { ReactNode } from "react";

/**
 * Khung căn giữa cho màn login/signup — phỏng theo AuthCard của dsvh
 * (docs/reference/dsvh-source/dsvh/dsvh/ui/auth/AuthCard.tsx) nhưng bỏ
 * LunorMark (logo của Vibe Host gốc, không phải brand app này).
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-stroke bg-surface p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="text-3xl">🌀</span>
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
