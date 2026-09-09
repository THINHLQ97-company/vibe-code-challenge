import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--ds-sidebar-bg)] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <span
              className="flex size-11 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--ds-primary)" }}
            >
              <Sparkles size={22} strokeWidth={2.25} />
            </span>
            <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="mt-1.5 text-base text-muted-foreground">{subtitle}</p>}
          </div>
          {children}
        </div>
        {footer && (
          <div className="mt-5 text-center text-sm text-[var(--ds-sidebar-fg)]">{footer}</div>
        )}
      </div>
    </div>
  );
}
