"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/dsvh/icons";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

const DOTS = "DOTS";

function getPaginationRange(
  page: number,
  totalPages: number,
  siblingCount: number
): (number | typeof DOTS)[] {
  const totalPageNumbers = siblingCount * 2 + 5;

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(page - siblingCount, 1);
  const rightSiblingIndex = Math.min(page + siblingCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, DOTS, lastPageIndex];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingCount;
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1
    );
    return [firstPageIndex, DOTS, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
  }

  return [];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = "",
}: PaginationProps) {
  if (totalPages <= 0) return null;

  const paginationRange = getPaginationRange(page, totalPages, siblingCount);

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  return (
    <nav aria-label="Pagination" className={`flex select-none items-center gap-1.5 text-body ${className}`}>
      <button
        type="button"
        onClick={() => !isFirstPage && onPageChange(page - 1)}
        disabled={isFirstPage}
        aria-disabled={isFirstPage}
        aria-label="Trang trước"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-stroke bg-surface text-ink-2 transition-colors hover:bg-stroke-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeftIcon size={16} aria-hidden={true} />
      </button>

      {paginationRange.map((item, index) => {
        if (item === DOTS) {
          return (
            <span key={`dots-${index}`} className="inline-flex h-9 min-w-9 select-none items-center justify-center px-1 font-medium text-ink-3">
              &#8230;
            </span>
          );
        }

        const isCurrent = item === page;

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={`Trang ${item}`}
            className={`inline-flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-3 text-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 ${
              isCurrent ? "bg-orange text-white shadow-sm" : "border border-stroke bg-surface text-ink-2 hover:bg-stroke-soft hover:text-ink"
            }`}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => !isLastPage && onPageChange(page + 1)}
        disabled={isLastPage}
        aria-disabled={isLastPage}
        aria-label="Trang kế tiếp"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-stroke bg-surface text-ink-2 transition-colors hover:bg-stroke-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRightIcon size={16} aria-hidden={true} />
      </button>
    </nav>
  );
}
