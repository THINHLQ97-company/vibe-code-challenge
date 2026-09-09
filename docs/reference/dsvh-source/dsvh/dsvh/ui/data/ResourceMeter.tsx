import type { ReactNode } from "react";

export interface ResourceMeterProps {
  /** Icon dẫn (CpuIcon / MemoryIcon / HardDriveIcon…). */
  icon?: ReactNode;
  label: string;
  used: number;
  total: number;
  unit?: string;
  /** Định dạng số (mặc định: nguyên → String, lẻ → 1 chữ số). */
  format?: (v: number) => string;
}

/** Ngưỡng màu theo % dùng — token DSVH. */
function barClass(pct: number): string {
  if (pct >= 90) return "bg-red";
  if (pct >= 70) return "bg-amber";
  return "bg-teal";
}

/**
 * Thanh đo tài nguyên (CPU core / RAM / disk): icon + nhãn + used/total, bar tô
 * theo ngưỡng (<70% teal · 70–90% amber · ≥90% red). Chỉ semantic token,
 * theme-aware. Dùng cho monitoring container và metrics trên AppCard.
 */
export function ResourceMeter({
  icon,
  label,
  used,
  total,
  unit = "",
  format,
}: ResourceMeterProps) {
  const pct = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0;
  const fmt = format ?? ((v: number) => (v % 1 === 0 ? String(v) : v.toFixed(1)));
  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-caption">
        <span className="flex items-center gap-1.5 text-ink-2">
          {icon}
          {label}
        </span>
        <span className="tabular-nums text-ink">
          <b className="font-semibold">{fmt(used)}</b>
          <span className="text-ink-3">
            {" "}
            / {fmt(total)} {unit}
          </span>
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-stroke-soft"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${barClass(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
