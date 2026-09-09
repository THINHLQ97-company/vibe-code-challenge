import type { ReactNode } from "react";
import { CloseIcon, SearchIcon } from "@/components/dsvh/icons";

export interface TableToolbarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** >0 → chuyển sang thanh hành động hàng loạt. */
  selectedCount?: number;
  onClearSelection?: () => void;
  /** Nút hành động hàng loạt (Xoá, Xuất…) — hiện khi có selection. */
  bulkActions?: ReactNode;
  /** Bộ lọc bên trái (Select/Chip…) — hiện khi KHÔNG selection. */
  filters?: ReactNode;
  /** Hành động chính bên phải (Thêm mới…). */
  actions?: ReactNode;
}

/**
 * Thanh công cụ trên [Table]: tìm kiếm + bộ lọc + hành động chính; khi có dòng
 * được chọn thì đổi sang chế độ "N đã chọn" + hành động hàng loạt. Responsive
 * (wrap trên mobile), chỉ semantic token, theme-aware.
 */
export function TableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Tìm kiếm…",
  selectedCount = 0,
  onClearSelection,
  bulkActions,
  filters,
  actions,
}: TableToolbarProps) {
  if (selectedCount > 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-card border border-b-0 border-orange/30 bg-orange/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-2.5 text-body">
          <button
            type="button"
            onClick={onClearSelection}
            aria-label="Bỏ chọn"
            className="grid size-7 place-items-center rounded-lg border border-orange/30 text-orange transition-colors hover:bg-orange/10"
          >
            <CloseIcon width={14} height={14} />
          </button>
          <span className="font-semibold text-ink">
            {selectedCount} đã chọn
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">{bulkActions}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-card border border-b-0 border-stroke bg-surface-2 px-3 py-2.5">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange !== undefined || search !== undefined ? (
          <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-lg border border-stroke bg-surface px-3 sm:max-w-xs">
            <SearchIcon width={16} height={16} className="shrink-0 text-ink-3" />
            <input
              value={search ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="w-full bg-transparent text-body text-ink outline-none placeholder:text-ink-3"
            />
          </div>
        ) : null}
        {filters}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
