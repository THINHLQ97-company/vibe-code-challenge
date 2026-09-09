"use client";

import { AppCard, type AppCardProps } from "@/components/dsvh/ui/deploy/AppCard";

export interface TemplateItem extends AppCardProps {
  id: string;
}

export interface TemplateGalleryProps {
  items: TemplateItem[];
  columns?: 2 | 3;
  /** Gọi khi bấm hành động trên 1 thẻ (nếu thẻ không tự đặt onDeploy). */
  onDeploy?: (id: string) => void;
  /** Gọi khi bấm CẢ THẺ — truyền xuống `AppCard.onSelect` (thẻ thành một đích bấm to). */
  onSelect?: (id: string) => void;
}

const COLS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
};

/**
 * Lưới catalog app (one-click deploy) — responsive (1 → sm:2 → lg:3), mỗi ô là
 * AppCard. Giải quyết đúng ca "chiều ngang rộng + metrics/category/action per-card".
 */
export function TemplateGallery({ items, columns = 3, onDeploy, onSelect }: TemplateGalleryProps) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${COLS[columns]}`}>
      {items.map(({ id, onDeploy: itemDeploy, onSelect: itemSelect, ...card }) => (
        <AppCard
          key={id}
          {...card}
          onDeploy={itemDeploy ?? (onDeploy ? () => onDeploy(id) : undefined)}
          onSelect={itemSelect ?? (onSelect ? () => onSelect(id) : undefined)}
        />
      ))}
    </div>
  );
}
