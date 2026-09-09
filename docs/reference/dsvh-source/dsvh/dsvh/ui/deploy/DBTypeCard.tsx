"use client";

import { DatabaseIcon, CheckIcon } from "@/components/dsvh/icons";
import { DB_BRAND } from "@/components/dsvh/brand-icons";

export type DBEngine = "postgres" | "mysql" | "redis" | "mongo";

export interface DBTypeOption {
  engine: DBEngine;
  name: string;
  tagline?: string;
  version?: string;
}

export interface DBTypeCardProps {
  options: DBTypeOption[];
  value?: DBEngine | null;
  onChange?: (engine: DBEngine) => void;
  columns?: 2 | 3 | 4;
}

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Lưới thẻ chọn loại database (Postgres/MySQL/Redis/Mongo). Icon tô theo màu hãng
 * (DB_BRAND), chọn = viền + ring cam + tick. Radiogroup, chỉ semantic token.
 */
export function DBTypeCard({ options, value, onChange, columns = 4 }: DBTypeCardProps) {
  return (
    <div role="radiogroup" className={`grid grid-cols-1 gap-3 ${COLS[columns]}`}>
      {options.map((opt) => {
        const selected = opt.engine === value;
        return (
          <button
            key={opt.engine}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(opt.engine)}
            className={`group relative flex flex-col items-start gap-2 rounded-card border p-4 text-left transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 ${
              selected
                ? "border-orange bg-orange/[0.06] ring-1 ring-orange/25"
                : "border-stroke bg-surface hover:border-stroke-hover hover:bg-stroke-soft"
            }`}
          >
            {selected && (
              <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-orange text-white">
                <CheckIcon size={13} />
              </span>
            )}
            <span
              className="grid size-10 place-items-center rounded-xl bg-surface-2"
              style={{ color: DB_BRAND[opt.engine] }}
            >
              <DatabaseIcon size={22} />
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-body font-semibold text-ink">{opt.name}</span>
              {opt.version && (
                <span className="text-meta tabular-nums text-ink-3">{opt.version}</span>
              )}
            </span>
            {opt.tagline && (
              <span className="text-caption leading-snug text-ink-2">{opt.tagline}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
