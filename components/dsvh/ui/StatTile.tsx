import type { ReactNode } from "react";

/**
 * KPI stat tile — label + big number + trend delta. Positive delta = teal,
 * negative = orange (DSVH convention).
 */
export function StatTile({
  label,
  value,
  delta,
  positive = true,
  action,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  positive?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col rounded-xl border border-stroke bg-surface-2 p-4 transition-colors duration-200 hover:border-stroke-hover hover:bg-surface">
      <div className="mb-3 flex items-start justify-between">
        <span className="text-body font-medium text-ink-2">{label}</span>
        {action}
      </div>
      <span className="mb-3 text-hero font-bold leading-none tracking-tight text-ink">
        {value}
      </span>
      {delta && (
        <span
          className={`text-caption font-medium ${
            positive ? "text-teal" : "text-orange"
          }`}
        >
          {delta}
        </span>
      )}
    </div>
  );
}
