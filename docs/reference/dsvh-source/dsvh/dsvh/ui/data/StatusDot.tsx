import type { ReactNode } from "react";

/**
 * StatusDot — chấm trạng thái VẬN HÀNH cho deploy / container / DB (queued,
 * building, live, failed…). Khác `status.ts` (4 tone semantic cho Alert/Toast/Badge):
 * đây là từ vựng riêng của hạ tầng, có PULSE cho trạng thái "đang diễn ra".
 * Màu lấy từ token DSVH — không hardcode hex.
 */
export type OpStatus =
  | "idle"
  | "queued"
  | "building"
  | "deploying"
  | "live"
  | "running"
  | "stopped"
  | "failed"
  | "degraded";

type Preset = { dot: string; text: string; label: string; pulse: boolean };

export const opStatusPresets: Record<OpStatus, Preset> = {
  idle: { dot: "bg-ink-3", text: "text-ink-2", label: "Nghỉ", pulse: false },
  queued: { dot: "bg-ink-3", text: "text-ink-2", label: "Đang chờ", pulse: false },
  building: { dot: "bg-amber", text: "text-amber-strong", label: "Đang build", pulse: true },
  deploying: { dot: "bg-amber", text: "text-amber-strong", label: "Đang deploy", pulse: true },
  live: { dot: "bg-teal", text: "text-teal", label: "Đang chạy", pulse: true },
  running: { dot: "bg-teal", text: "text-teal", label: "Đang chạy", pulse: true },
  stopped: { dot: "bg-ink-3", text: "text-ink-3", label: "Đã dừng", pulse: false },
  failed: { dot: "bg-red", text: "text-red", label: "Thất bại", pulse: false },
  degraded: { dot: "bg-amber", text: "text-amber-strong", label: "Suy giảm", pulse: true },
};

export interface StatusDotProps {
  status: OpStatus;
  /** Ghi đè nhãn mặc định (theo preset). */
  label?: ReactNode;
  /** Ẩn nhãn, chỉ hiện chấm. */
  showLabel?: boolean;
  /** Ép bật/tắt pulse (mặc định theo preset). */
  pulse?: boolean;
  className?: string;
}

export function StatusDot({
  status,
  label,
  showLabel = true,
  pulse,
  className = "",
}: StatusDotProps) {
  const p = opStatusPresets[status] ?? opStatusPresets.idle;
  const animate = pulse ?? p.pulse;
  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap ${className}`}>
      <span className="relative flex size-2.5 shrink-0">
        {animate && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${p.dot}`}
            aria-hidden
          />
        )}
        <span className={`relative inline-flex size-2.5 rounded-full ${p.dot}`} />
      </span>
      {showLabel && (
        <span className={`text-caption font-medium ${p.text}`}>{label ?? p.label}</span>
      )}
    </span>
  );
}
