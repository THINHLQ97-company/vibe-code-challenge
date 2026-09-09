"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/dsvh/ui/Badge";
import { CpuIcon, MemoryIcon, HardDriveIcon, ChevronRightIcon } from "@/components/dsvh/icons";

export interface AppMetrics {
  core?: string;
  ram?: string;
  disk?: string;
}

export interface AppCardProps {
  /** Logo/icon của app (brand-icon hoặc icon UI). */
  icon?: ReactNode;
  name: string;
  category?: string;
  description?: string;
  metrics?: AppMetrics;
  actionLabel?: string;
  onDeploy?: () => void;
  /**
   * Bấm CẢ THẺ (không riêng nút hành động) — catalog thường muốn cả ô là một đích bấm to.
   * Có `onSelect` thì thẻ render bằng `<button>` và nhãn hành động tụt xuống `<span>` (không lồng
   * button trong button — HTML không hợp lệ, và trình đọc màn hình đọc thành hai đích chồng nhau).
   * Không có thì giữ nguyên `<div>` + nút hành động thật như cũ.
   */
  onSelect?: () => void;
  /** aria-label cho cả thẻ khi `onSelect` — mặc định "<actionLabel> <name>". */
  selectLabel?: string;
}

/**
 * Nền thẻ đổi màu khi rê chuột (`hover:bg-stroke-soft`) — CÙNG token với hover của hàng trong
 * `Table`, để "một ô danh sách đang được trỏ tới" nhìn giống nhau dù là hàng bảng hay thẻ lưới.
 * Chip icon đi ngược lại (`bg-stroke-soft` → `group-hover:bg-surface`): lúc nghỉ là chấm xám trên
 * thẻ trắng, lúc hover thành chấm trắng trên thẻ xám, nên chip không bao giờ chìm vào nền thẻ.
 */
const CARD_BASE =
  "group flex h-full gap-3 rounded-card border border-stroke bg-surface p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-300 hover:-translate-y-[3px] hover:border-stroke-hover hover:bg-stroke-soft hover:shadow-[0_16px_44px_-16px_rgba(10,13,20,0.16)]";

/**
 * Thẻ app trong catalog (one-click deploy): logo + tên + Badge category + mô tả +
 * metrics core/RAM/disk (icon + số) + nút hành động. Hover-lift + đổi nền. Chỉ semantic token.
 */
export function AppCard({
  icon,
  name,
  category,
  description,
  metrics,
  actionLabel = "Triển khai",
  onDeploy,
  onSelect,
  selectLabel,
}: AppCardProps) {
  const body = (
    <>
      {/* Media-object: icon trái, cột content dùng CHUNG một mép trái. */}
      <span className="grid size-10 shrink-0 self-start place-items-center rounded-xl bg-stroke-soft text-ink-2 transition-colors duration-300 group-hover:bg-surface">
        {icon}
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* `pb-4` là SÀN khoảng hở từ nội dung xuống đường kẻ. `mt-auto` của footer chỉ ăn phần dư
            khi thẻ cao hơn nội dung — cả lưới cùng mô tả 1 dòng thì không dư gì, đường kẻ dính ngay
            dưới chữ (bắt được ở `/templates`, và bản DSVH gốc cũng vậy). Sàn này đảm bảo mọi thẻ đều
            có khoảng thở, dù mô tả 1 hay 2 dòng. */}
        <div className="pb-4">
          <div className="flex items-center gap-2">
            <span className="truncate text-body font-semibold text-ink">{name}</span>
            {category && (
              <Badge tone="neutral" size="sm" className="shrink-0">
                {category}
              </Badge>
            )}
          </div>

          {description && (
            <p className="mt-2 line-clamp-2 text-caption leading-snug text-ink-2">{description}</p>
          )}
        </div>

        {/* Footer pin đáy (mt-auto) + pt-3.5 để đường kẻ không sát metrics. */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-stroke pt-3.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-3">
            {metrics?.core && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <CpuIcon size={14} /> {metrics.core}
              </span>
            )}
            {metrics?.ram && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <MemoryIcon size={14} /> {metrics.ram}
              </span>
            )}
            {metrics?.disk && (
              <span className="flex items-center gap-1 whitespace-nowrap">
                <HardDriveIcon size={14} /> {metrics.disk}
              </span>
            )}
          </div>
          {onSelect ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 self-end whitespace-nowrap text-caption font-semibold text-orange transition-colors group-hover:text-orange-bright">
              {actionLabel} <ChevronRightIcon size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          ) : (
            <button
              type="button"
              onClick={onDeploy}
              className="inline-flex shrink-0 items-center gap-0.5 self-end whitespace-nowrap text-caption font-semibold text-orange transition-colors hover:text-orange-bright"
            >
              {actionLabel} <ChevronRightIcon size={15} />
            </button>
          )}
        </div>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={selectLabel ?? `${actionLabel} ${name}`}
        className={`${CARD_BASE} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30`}
      >
        {body}
      </button>
    );
  }

  return <div className={CARD_BASE}>{body}</div>;
}
