import type { ReactNode } from "react";

/**
 * Tiêu đề trang — khối ĐẦU TIÊN của mọi trang trong vùng nội dung.
 *
 * Chuyển vào DSVH ngày 05/08/2026 (trước ở `src/components/shared/page-header.tsx`, 17 file dùng).
 * Vì nó nằm ngoài design system nên trang `/dsvh` không mô tả nổi cấu trúc một trang — xem mục
 * "Cấu trúc trang" ở nhóm Bố cục.
 *
 * Cỡ chữ giữ NGUYÊN của bản cũ (`text-page` = 24px, `text-body` = 14px) để việc chuyển hệ token là
 * zero-visual: đây là bước đổi NGUỒN màu, không phải bước thiết kế lại.
 */
export interface PageHeaderProps {
  title: string;
  subtitle: string;
  /** Hành động ở góc phải (nút tạo mới, bộ lọc…). Không có thì tiêu đề chiếm trọn hàng. */
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div>
        <h1 className="text-page font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-body text-ink-2">{subtitle}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
