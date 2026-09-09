import type { ReactNode } from "react";

export interface MetricGaugeProps {
  value: number;
  /** Giá trị tối đa (mặc định 100 → value là %). */
  max?: number;
  label?: string;
  sublabel?: string;
  unit?: string;
  /** Đường kính px (mặc định 168). */
  size?: number;
  /** Ngưỡng cảnh báo/nguy hiểm theo % (mặc định 70 / 90). */
  thresholds?: { warning: number; danger: number };
  /** Ép màu; "auto" = theo ngưỡng. */
  tone?: "auto" | "teal" | "amber" | "red" | "orange" | "ink";
  format?: (v: number) => string;
  centerSlot?: ReactNode;
}

const TONE_CLASS: Record<string, string> = {
  teal: "text-teal",
  amber: "text-amber",
  red: "text-red",
  orange: "text-orange",
  ink: "text-ink",
};

/** Cung 270° (khe hở dưới đáy) — vẽ bằng dasharray + xoay 135°. */
const ARC_FRACTION = 0.75;

/**
 * Đồng hồ đo một chỉ số (CPU %, uptime, quota…): cung 270° tô màu theo ngưỡng
 * (`<70%` teal · `70–90%` amber · `≥90%` red), số lớn ở giữa. Chỉ semantic
 * token, theme-aware. Bổ trợ [ResourceMeter] khi cần điểm nhấn 1 metric.
 */
export function MetricGauge({
  value,
  max = 100,
  label,
  sublabel,
  unit = "%",
  size = 168,
  thresholds = { warning: 70, danger: 90 },
  tone = "auto",
  format,
  centerSlot,
}: MetricGaugeProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const resolvedTone =
    tone !== "auto"
      ? tone
      : pct >= thresholds.danger
        ? "red"
        : pct >= thresholds.warning
          ? "amber"
          : "teal";
  const toneClass = TONE_CLASS[resolvedTone] ?? "text-teal";

  /**
   * Cỡ chữ ở giữa PHẢI co theo đường kính.
   *
   * Bản đầu ghim cứng `text-kpi` (28px) cho mọi `size`. Ở bản mặc định 168px thì vừa, nhưng đồng hồ
   * nhỏ (dashboard xếp 4 cái một hàng) thì con số chạm vào vành cung và dòng phụ bên dưới tràn ra
   * ngoài. `size` là prop công khai, nên mọi cỡ nó nhận đều phải ra hình đúng — không thể chỉ đúng
   * ở một cỡ rồi để nơi gọi tự bù.
   *
   * Vẫn nằm trong 8 bậc chữ có tên: kpi(28) · page(24) · title(16).
   */
  const big = size >= 150;
  const mid = size >= 116;
  const valueClass = big ? "text-kpi" : mid ? "text-page" : "text-title";
  const unitClass = big ? "text-body" : "text-caption";

  const stroke = Math.max(8, Math.round(size * 0.075));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const track = ARC_FRACTION * c;
  const cx = size / 2;
  const fmt = format ?? ((v: number) => (v % 1 === 0 ? String(v) : v.toFixed(1)));

  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{ width: size }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          {/* Track */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${track} ${c}`}
            transform={`rotate(135 ${cx} ${cx})`}
            className="stroke-stroke-soft"
          />
          {/* Value */}
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(track * pct) / 100} ${c}`}
            transform={`rotate(135 ${cx} ${cx})`}
            className={`${toneClass} stroke-current transition-[stroke-dasharray] duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerSlot ?? (
            <>
              <div className="flex items-baseline gap-0.5 tabular-nums">
                <span className={`${valueClass} font-bold leading-none tracking-tight text-ink`}>
                  {fmt(value)}
                </span>
                {unit && (
                  <span className={`${unitClass} font-semibold text-ink-3`}>
                    {unit}
                  </span>
                )}
              </div>
              {sublabel && (
                <span className={`mt-1 whitespace-nowrap ${big ? "text-caption" : "text-meta"} text-ink-3`}>
                  {sublabel}
                </span>
              )}
            </>
          )}
        </div>
      </div>
      {label && (
        <span className="mt-1 text-body font-medium text-ink-2">{label}</span>
      )}
    </div>
  );
}
