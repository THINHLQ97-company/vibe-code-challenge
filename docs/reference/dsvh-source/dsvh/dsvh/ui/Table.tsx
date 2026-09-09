"use client";

import { useTranslation } from "react-i18next";
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  MinusIcon,
  FileIcon,
} from "@/components/dsvh/icons";
import { Empty } from "./data/Empty";
import {
  TableBooleanCell,
  TableDateCell,
  TableLinkCell,
  TableNumberCell,
  TableStatusCell,
  TableTagsCell,
  TableTextCell,
  TableUsageCell,
  TableUserCell,
} from "./table-cells";
import type { Status } from "@/components/dsvh/status";

/**
 * Cột khai `type` thì Table tự dựng ô — không phải viết `render` tay cho những kiểu dữ liệu lặp đi
 * lặp lại. Mọi kiểu ở đây đều trỏ về ô dựng sẵn trong `table-cells.tsx`, KHÔNG dựng lại tại chỗ:
 * đây và `Giải phẫu một bảng` phải là cùng một thứ, nếu không sẽ lại có hai cách làm cùng một ô.
 *
 * `"usage"` bắt buộc nói rõ hướng ngưỡng nên mặc định `high-bad` (mức dùng tài nguyên — ca áp đảo
 * trong panel này); cột nào là độ hoàn thành thì dùng `render` với `direction="low-bad"`.
 */
function renderCellByType(type: ColumnCellType, value: unknown): React.ReactNode {
  switch (type) {
    case "text":
      return <TableTextCell value={value as React.ReactNode} />;
    case "number":
      return <TableNumberCell value={value as number} />;
    case "currency":
      return <TableNumberCell value={value as number} format="currency" />;
    case "percent":
      return <TableNumberCell value={value as number} format="percent" />;
    case "tags":
      return <TableTagsCell tags={Array.isArray(value) ? (value as string[]) : []} />;
    case "usage":
      return <TableUsageCell value={Number(value) || 0} direction="high-bad" />;
    case "date":
      return <TableDateCell value={value as string | Date} />;
    case "datetime":
      return <TableDateCell value={value as string | Date} withTime />;
    case "boolean":
      return <TableBooleanCell value={value as boolean} />;
    case "status":
      return <TableStatusCell status={value as Status} />;
    case "user":
      return <TableUserCell name={String(value ?? "")} />;
    case "link":
      return <TableLinkCell text={String(value ?? "")} href={String(value ?? "#")} />;
    default:
      return (value as React.ReactNode) ?? null;
  }
}

export type TableAlign = "left" | "center" | "right";
export type TableVariant = "default" | "bordered" | "zebra";
export type TableDensity = "compact" | "comfortable";
export type SortDirection = "asc" | "desc";

export interface SortState {
  columnKey: string;
  direction: SortDirection;
}

export type ColumnCellType =
  | "text" | "number" | "currency" | "percent" | "tags" | "usage"
  | "date" | "datetime" | "boolean" | "status" | "user" | "link";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  accessorKey?: keyof T;
  align?: TableAlign;
  width?: string | number;
  /**
   * TRẦN bề ngang của cột — thứ DUY NHẤT làm `truncate` có tác dụng thật trong bảng này.
   *
   * ── VÌ SAO `width` MỘT MÌNH KHÔNG ĐỦ (đo 24/08/2026) ──────────────────────────────────────
   * Bảng chạy `table-layout: auto`, nên `width` trên `<th>` chỉ là GỢI Ý: một ô có nội dung dài
   * hơn sẽ kéo cột rộng ra bất chấp. Và `<td>` mang sẵn `whitespace-nowrap` (luật nền của bảng),
   * nên nội dung không rớt dòng mà đẩy ngang — cả bảng phải cuộn.
   *
   * Lớp `truncate` bên trong ô KHÔNG cứu được: nó cần một ancestor có bề ngang HỮU HẠN mới cắt
   * được, mà `<td>` tự nở theo nội dung thì `max-w-full` của ô con = 100% của một thứ vô hạn.
   *
   * Đây là lỗi đã trả giá thật: cột "Nguyên nhân ghi lại" ở bảng lượt hỏng được thêm `truncate`
   * ngày 20/08 và bộ kiểm dựng vẫn XANH — vì nó khẳng định LỚP CSS có mặt, không khẳng định được
   * hiệu quả bố cục. Trên trình duyệt thật bảng vẫn cuộn ngang y như cũ.
   *
   * `maxWidth` đặt lên CHÍNH `<td>` thì trình duyệt buộc phải cắt: `max-width` là ràng buộc cứng
   * kể cả trong `table-layout: auto`. Ô con vẫn cần `truncate` để có dấu "…".
   */
  maxWidth?: string | number;
  sortable?: boolean;
  /** built-in cell renderer by data type (needs accessorKey). `render` wins if both set. */
  type?: ColumnCellType;
  /**
   * `group` cho biết dòng này đang đứng ở đâu TRONG CỤM — nhờ đó ô đầu vẽ được nét nối cây
   * (`TreeGuide`/`TreeRow`): phải biết "còn anh em phía dưới không" mới quyết được `├─` hay `└─`.
   * `Table` vốn đã tính sẵn `first`/`last` khi gom cụm nhưng giữ cho riêng mình để kẻ khung; nay
   * đẩy xuống đây thay vì bắt nơi gọi tự gom cụm lần thứ hai và tự suy ra (hai phép gom song song
   * là hai nguồn sự thật — lệch nhau lúc nào không biết).
   * Dòng KHÔNG thuộc cụm nào thì `group` là `undefined`.
   */
  render?: (row: T, index: number, group?: { key: string; first: boolean; last: boolean }) => React.ReactNode;
  /**
   * ƯU TIÊN CỘT — ẩn cột này khi màn hẹp hơn ngưỡng, thay vì bắt cuộn ngang.
   *
   * App tối ưu cho PC (1366 → 1920 là dải phổ thông). Đo ngày 05/08 ở
   * `/admin/deployments`: bảng cần 1331px mà 1366/1440 chỉ có 1076/1150px → luôn phải cuộn để
   * thấy trạng thái và hành động. Cuộn ngang là lối THOÁT cuối, không phải trải nghiệm mặc định.
   *
   * Chỉ dùng cho cột mà thông tin CÒN LẤY ĐƯỢC ở chỗ khác (trùng lặp, hoặc có trong trang chi
   * tiết). KHÔNG ẩn cột mang thông tin duy nhất — như vậy là giấu dữ liệu, không phải responsive.
   */
  hideBelow?: "md" | "lg" | "xl" | "2xl";
}

/** Tailwind không đọc được class dựng động, nên phải liệt kê tĩnh. */
const HIDE_BELOW: Record<NonNullable<ColumnDef<unknown>["hideBelow"]>, string> = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
};

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalRows: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId?: (row: T, index: number) => string | number;
  selectable?: boolean;
  selectedRowIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  sortState?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  variant?: TableVariant;
  density?: TableDensity;
  /**
   * Ghim hàng tiêu đề khi cuộn. Mặc định `true`, NHƯNG chỉ có nghĩa khi bảng CÓ KHUNG CUỘN RIÊNG —
   * tức là có truyền `maxHeight`.
   *
   * Không có `maxHeight` thì bảng không tự cuộn, cả CỬA SỔ cuộn, và `sticky top-0` của `<thead>`
   * neo vào đỉnh cửa sổ. Trang nào cũng có thanh đầu dính ở đúng chỗ đó thì hai thứ chồng nhau:
   * gặp thật 13/08 ở tab "Lịch sử triển khai" — hàng tiêu đề bảng đè lên tiêu đề trang, chữ chồng
   * chữ (bảng nằm sau trong DOM nên thắng ở cùng `z-10`).
   *
   * Ba lối ra, theo thứ tự nên chọn:
   *   1. cho bảng khung cuộn riêng bằng `maxHeight` — ghim hoạt động đúng nghĩa, không đụng ai;
   *   2. `stickyHeader={false}` nếu cột tự nói lên nội dung và mất tiêu đề không làm ai lạc;
   *   3. giữ ghim thì thanh đầu trang phải ở lớp cao hơn (`z-40`) và bảng phải neo dưới nó — cách
   *      này cần một con số chiều cao gõ tay, sẽ trôi khi thanh đầu đổi nội dung. Tránh.
   */
  stickyHeader?: boolean;
  /** pin the first column (and selection checkbox) when scrolling horizontally */
  pinFirstColumn?: boolean;
  maxHeight?: string | number;
  loading?: boolean;
  skeletonRows?: number;
  emptyText?: string;
  /**
   * Lớp CSS thêm cho TỪNG hàng, tính từ dữ liệu của hàng đó.
   *
   * Thêm 13/08/2026. Trước bản này `Table` không có cách nào tô riêng một hàng, nên bảng nào cần —
   * ví dụ "Khách hàng gần đây" ở `/admin/dashboard` làm mờ hàng tài khoản đã xoá — buộc phải ở lại
   * `<table>` của shadcn. Đúng loại thiếu sót giữ chân người ta lại với bản cũ: không phải vì họ
   * ngại đổi, mà vì bản DSVH chưa nói được điều họ cần nói.
   *
   * Chỉ dùng cho lớp TRANG TRÍ (mờ, nhấn nền). Nền theo trạng thái vẫn nên đi qua ô `status` để
   * ngữ nghĩa nằm ở cột, không nằm ở màu cả hàng.
   */
  rowClassName?: (row: T, index: number) => string | undefined;
  emptySubtext?: string;
  emptyIcon?: React.ReactNode;
  pagination?: PaginationConfig;
  /**
   * GOM DÒNG THÀNH KHỐI CÓ KHUNG — vd các thành phần của một cụm.
   *
   * VÌ SAO Ở TABLE chứ không vá tại chỗ dùng: một danh sách phẳng KHÔNG nói được rằng mấy dòng liền
   * nhau là MỘT thứ. Nhét thêm chữ "thành phần 1/2" vào từng dòng thì mỗi dòng vẫn là một hòn đảo —
   * người đọc phải tự ghép. Quan hệ "thuộc về nhau" là quan hệ THỊ GIÁC, phải vẽ bằng khung.
   *
   * `keyOf` trả `null` ⇒ dòng đứng riêng như cũ. Các dòng cùng khoá được KÉO LIỀN NHAU (neo tại vị
   * trí dòng đầu tiên của nhóm), nên thứ tự sắp xếp tổng thể vẫn giữ mà nhóm không bị xé.
   */
  rowGroup?: {
    keyOf: (row: T) => string | null | undefined;
    /** Dòng tiêu đề của khối. Nhận khoá + đủ các dòng trong nhóm để đếm/tóm tắt. */
    header: (key: string, rows: T[]) => React.ReactNode;
  };
  className?: string;
  tableClassName?: string;
}

/**
 * Kéo các dòng cùng nhóm về liền nhau, neo tại vị trí dòng ĐẦU TIÊN của nhóm.
 *
 * Không sắp xếp lại toàn bộ: thứ tự người dùng đang thấy (mới nhất trước) là thông tin, không được
 * phá. Chỉ dồn thành viên của một nhóm lên cạnh nhau.
 */
function clusterByGroup<T>(rows: T[], keyOf: (row: T) => string | null | undefined): { row: T; groupKey: string | null; first: boolean; last: boolean }[] {
  const order: (string | null)[] = [];
  const buckets = new Map<string, T[]>();
  const singles: T[] = [];
  for (const r of rows) {
    const k = keyOf(r) ?? null;
    if (k == null) {
      order.push(null);
      singles.push(r);
      continue;
    }
    if (!buckets.has(k)) {
      buckets.set(k, []);
      order.push(k);
    }
    buckets.get(k)!.push(r);
  }
  const out: { row: T; groupKey: string | null; first: boolean; last: boolean }[] = [];
  let singleAt = 0;
  for (const k of order) {
    if (k == null) {
      out.push({ row: singles[singleAt++], groupKey: null, first: false, last: false });
      continue;
    }
    const members = buckets.get(k)!;
    members.forEach((row, i) => out.push({ row, groupKey: k, first: i === 0, last: i === members.length - 1 }));
  }
  return out;
}

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  {
    checked?: boolean;
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
  }
>(({ checked = false, indeterminate = false, onChange, disabled, ariaLabel }, ref) => {
  const defaultRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => defaultRef.current as HTMLInputElement);

  React.useEffect(() => {
    if (defaultRef.current) {
      defaultRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const isCheckedOrIndeterminate = checked || indeterminate;

  return (
    <label className="relative inline-flex cursor-pointer select-none items-center justify-center">
      <input
        ref={defaultRef}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange?.(e.target.checked)}
        className="peer sr-only"
      />
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-lg border transition-all ${
          isCheckedOrIndeterminate
            ? "border-orange bg-orange text-surface"
            : "border-stroke bg-surface hover:border-stroke-soft peer-focus-visible:ring-2 peer-focus-visible:ring-orange/40"
        } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      >
        {indeterminate ? (
          <MinusIcon className="h-3 w-3 stroke-[3] text-surface" />
        ) : checked ? (
          <CheckIcon className="h-3 w-3 stroke-[3] text-surface" />
        ) : null}
      </div>
    </label>
  );
});
Checkbox.displayName = "Checkbox";

function TableSkeletonRow({
  columnsCount,
  selectable,
  density,
  variant,
}: {
  columnsCount: number;
  selectable?: boolean;
  density: TableDensity;
  variant: TableVariant;
}) {
  const pyClass = density === "compact" ? "py-2 px-3" : "py-3.5 px-4";
  const borderClass = variant === "bordered" ? "border-b border-stroke" : "border-b border-stroke-soft";

  return (
    <tr className={`animate-pulse ${borderClass}`}>
      {selectable && (
        <td className={`${pyClass} w-10 text-center`}>
          <div className="mx-auto h-4 w-4 rounded-lg bg-stroke-soft" />
        </td>
      )}
      {Array.from({ length: columnsCount }).map((_, idx) => (
        <td key={idx} className={pyClass}>
          <div className="h-4 rounded-lg bg-stroke-soft" style={{ width: `${55 + ((idx * 17) % 35)}%` }} />
        </td>
      ))}
    </tr>
  );
}

/**
 * HÀNG "KHÔNG CÓ DỮ LIỆU" — nay dựng bằng `Empty` của DSVH (19/08/2026).
 *
 * ── VÌ SAO ĐỔI ────────────────────────────────────────────────────────────────────────────────
 * Bản trước tự vẽ: icon bọc trong khung `rounded-2xl border bg-surface-2`, tiêu đề `font-semibold
 * text-ink`. Tức app có HAI trạng thái rỗng khác nhau về thị giác — `Empty` (23 tệp, có trong
 * manifest, luật #8 bắt icon để mộc) và bản này (21 chỗ, KHÔNG có trong manifest, ai đọc `/dsvh`
 * cũng không biết nó tồn tại). Đúng lại cái đã gỡ ngày 11/08 khi gộp `EmptyState` của `shared/` về
 * `Empty`: lần ấy gộp hai bản ĐỨNG NGOÀI bảng, còn bản NẰM TRONG bảng thì bị bỏ sót.
 *
 * Thấy được ở `/admin/dashboard`: tab "Hạ tầng" vẽ `Empty` khi không có node, còn tab "Toàn bộ
 * khách hàng" vẽ bản này khi bảng rỗng — hai màn trống cạnh nhau, hai kiểu, cùng một ý.
 *
 * ── VÌ SAO `variant="inline"` ─────────────────────────────────────────────────────────────────
 * Đúng luật chọn variant đã ghi ở `Empty`: khối này nằm TRONG một bảng vốn đã có khung, nên thêm
 * khung nữa là hai đường viền lồng nhau. `py-6` của `inline` cộng với `py-6` của `<td>` cho ra
 * khoảng thở tương đương `py-12` cũ mà không phải khoá cứng con số ở hai nơi.
 *
 * ── GỘP HAI PHÍA (20/08) ──────────────────────────────────────────────────────────────────────
 * Bản này viết 19/08 CỐ Ý giữ nguyên hai câu tiếng Việt viết cứng, lý lẽ là "đổi chữ ở đây là đổi
 * 21 màn cùng lúc, để việc khác". Trên `dev-test` thì việc khác ấy ĐÃ có người làm: hai câu nay là
 * `t("ds.table_empty")` / `t("ds.table_empty_hint")`.
 *
 * Lượt gộp lấy CẢ HAI phía chứ không chọn một: cấu trúc đi qua `Empty` (bên này) + chuỗi qua i18n
 * (bên kia). Chọn một phía là đánh rơi thứ phía kia vừa sửa — giữ `Empty` mà bỏ i18n thì hai câu
 * tiếng Việt cứng quay lại đúng 21 màn; giữ i18n mà bỏ `Empty` thì dựng lại trạng thái rỗng thứ hai.
 */
function TableEmptyState({
  colSpan,
  icon,
  text,
  subtext,
}: {
  colSpan: number;
  icon?: React.ReactNode;
  text?: string;
  subtext?: string;
}) {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-6">
        <Empty
          icon={icon || <FileIcon size={40} />}
          title={text || t("ds.table_empty")}
          description={subtext || t("ds.table_empty_hint")}
        />
      </td>
    </tr>
  );
}

/**
 * Thanh phân trang.
 *
 * ── CÂU CHỮ QUA i18n (20/08/2026) ────────────────────────────────────────────────────────────
 * Bản trước viết cứng tiếng Việt ("Hiển thị… trong tổng số… dòng", "Trang x / y", nhãn `aria-label`
 * của hai nút). Nó nằm im được vì KHÔNG MÀN NÀO dùng phân trang — đếm 20/08: 0 nơi gọi. Lượt này
 * `/admin/dashboard` bật nó lên ở bốn bảng, tức những chuỗi ấy lần đầu ra màn — và ra thẳng vào bản
 * `en`, nơi chúng là tiếng nước ngoài.
 *
 * Cùng lớp lỗi mà `TableEmptyState` vừa phải sửa: chuỗi viết cứng trong DSVH không có bộ kiểm i18n
 * nào chạm tới (`i18n-sync-smoke` chỉ soi tệp locale, `admin-dashboard-i18n-smoke` chỉ soi module).
 * Chỗ duy nhất bắt được là mắt người, sau khi đã lên màn.
 */
export function TablePagination({
  currentPage,
  totalPages,
  totalRows,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: PaginationConfig) {
  const { t } = useTranslation();
  const startItem = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalRows);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-b-xl border-t border-stroke bg-surface px-4 py-3 text-caption text-ink-2">
      <div className="flex items-center space-x-2">
        <span>{t("ds.page_showing")}</span>
        <span className="font-semibold text-ink">
          {startItem} - {endItem}
        </span>
        <span>{t("ds.page_of")}</span>
        <span className="font-semibold text-ink">{totalRows}</span>
        <span>{t("ds.page_rows")}</span>

        {onPageSizeChange && (
          <div className="ml-4 flex items-center space-x-1 border-l border-stroke pl-4">
            <span className="text-ink-3">{t("ds.page_size")}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="cursor-pointer rounded-lg border border-stroke bg-surface-2 px-2 py-1 text-caption text-ink focus:outline-none focus:border-orange"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <span className="mr-2 text-ink-3">
          {t("ds.page_label")} <span className="font-semibold text-ink">{currentPage}</span> / {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label={t("ds.page_prev")}
          className="inline-flex items-center justify-center rounded-lg border border-stroke bg-surface p-1.5 text-ink transition-colors hover:bg-stroke-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label={t("ds.page_next")}
          className="inline-flex items-center justify-center rounded-lg border border-stroke bg-surface p-1.5 text-ink transition-colors hover:bg-stroke-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function Table<T>({
  data,
  columns,
  getRowId = (_, idx) => idx,
  rowClassName,
  selectable = false,
  selectedRowIds = [],
  onSelectionChange,
  sortState: externalSortState,
  onSortChange,
  variant = "default",
  density = "comfortable",
  stickyHeader = true,
  pinFirstColumn = false,
  maxHeight,
  loading = false,
  skeletonRows = 5,
  emptyText,
  emptySubtext,
  emptyIcon,
  pagination,
  rowGroup,
  className = "",
  tableClassName = "",
}: TableProps<T>) {
  const { t } = useTranslation();
  const [internalSortState, setInternalSortState] = useState<SortState | null>(null);
  const currentSort = externalSortState !== undefined ? externalSortState : internalSortState;

  const getAlignClass = (align?: TableAlign) => {
    if (align === "center") return "text-center";
    if (align === "right") return "text-right";
    return "text-left";
  };

  /**
   * `whitespace-nowrap` đặt ở CHÍNH `<td>` — luật nền của bảng: ô KHÔNG BAO GIỜ rớt dòng.
   *
   * Vá ở từng ô lẻ là không đủ, và đã sai một lượt vì thế: đặt `whitespace-nowrap` cho riêng
   * `TableLinkCell` xong thì địa chỉ hết rớt dòng, nhưng NGÀY (`2026-08-06` gãy ở dấu gạch) và
   * CHIP phân loại (icon một dòng, chữ một dòng) vẫn rớt — vì chúng là ô khác. Mỗi ô mới viết sau
   * này lại là một chỗ để quên. Chặn ở `<td>` thì mọi ô, kể cả ô nơi gọi tự dựng bằng `render`,
   * đều thừa hưởng.
   *
   * Chật thì bảng KÉO NGANG (đã có vệt mờ hai mép báo còn nội dung). Lý do: một dòng bảng là MỘT
   * bản ghi; cho nó cao hai ba dòng thì mọi hàng khác cao theo hàng cao nhất, và mắt mất khả năng
   * quét dọc — thứ duy nhất khiến bảng hơn một danh sách.
   */
  const cellPadding =
    density === "compact" ? "py-2 px-3 text-caption whitespace-nowrap" : "py-3 px-4 text-body whitespace-nowrap";
  const headerPadding = density === "compact" ? "py-2.5 px-3 text-caption font-semibold" : "py-3.5 px-4 text-caption font-semibold";

  const pin = pinFirstColumn;
  const firstColLeft = selectable ? "left-10" : "left-0";
  const headPinCheckbox = pin ? "sticky left-0 z-30 bg-surface" : "";
  const headPinFirst = pin ? `sticky ${firstColLeft} z-30 bg-surface border-r border-stroke` : "";

  const allRowIds = data.map((row, idx) => getRowId(row, idx));
  const isAllSelected = data.length > 0 && allRowIds.every((id) => selectedRowIds.includes(id));
  const isSomeSelected =
    data.length > 0 && allRowIds.some((id) => selectedRowIds.includes(id)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const combined = Array.from(new Set([...selectedRowIds, ...allRowIds]));
      onSelectionChange(combined);
    } else {
      const remaining = selectedRowIds.filter((id) => !allRowIds.includes(id));
      onSelectionChange(remaining);
    }
  };

  const handleSelectRow = (rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRowIds, rowId]);
    } else {
      onSelectionChange(selectedRowIds.filter((id) => id !== rowId));
    }
  };

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (!col.sortable) return;

    let nextSort: SortState | null = null;
    if (currentSort?.columnKey === col.key) {
      if (currentSort.direction === "asc") {
        nextSort = { columnKey: col.key, direction: "desc" };
      } else {
        nextSort = null;
      }
    } else {
      nextSort = { columnKey: col.key, direction: "asc" };
    }

    if (onSortChange) {
      onSortChange(nextSort);
    } else {
      setInternalSortState(nextSort);
    }
  };

  const sortedData = React.useMemo(() => {
    if (onSortChange || !currentSort || !currentSort.direction) {
      return data;
    }
    const col = columns.find((c) => c.key === currentSort.columnKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      const valA = col.accessorKey ? a[col.accessorKey] : null;
      const valB = col.accessorKey ? b[col.accessorKey] : null;

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const comp = valA < valB ? -1 : 1;
      return currentSort.direction === "asc" ? comp : -comp;
    });
  }, [data, currentSort, columns, onSortChange]);

  /**
   * Dồn nhóm SAU khi sắp xếp, không phải trước: người dùng bấm sắp theo cột nào thì thứ tự ấy vẫn
   * quyết định vị trí của cả khối (theo dòng đầu tiên của nó), chỉ có điều khối không bị xé rời.
   */
  const clusteredRows = React.useMemo(
    () =>
      rowGroup
        ? clusterByGroup(sortedData, rowGroup.keyOf)
        : sortedData.map((row) => ({ row, groupKey: null as string | null, first: false, last: false })),
    [sortedData, rowGroup]
  );

  const totalCols = columns.length + (selectable ? 1 : 0);

  /**
   * Dấu hiệu CÒN NỘI DUNG BÊN PHẢI khi bảng rộng hơn khung.
   *
   * `overflow-x-auto` cho cuộn được, nhưng KHÔNG nói cho người dùng biết là cuộn được — trên
   * màn hẹp cột cuối bị cắt gọn gàng ở mép, nhìn như bảng chỉ có ngần ấy cột. Ở đây vẽ một vệt
   * mờ dần ở mép phải, tự tắt khi đã cuộn tới cuối. Không chiếm chỗ layout (`pointer-events-none`
   * + `absolute`), nên không đụng gì tới bố cục bảng.
   */
  const scrollRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ left: false, right: false });
  const syncEdge = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdge({ left: el.scrollLeft > 1, right: max > 1 && el.scrollLeft < max - 1 });
  }, []);
  useLayoutEffect(syncEdge, [syncEdge, data, columns]);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(syncEdge);
    ro.observe(el);
    return () => ro.disconnect();
  }, [syncEdge]);

  return (
    <div className={`relative w-full overflow-hidden rounded-xl border border-stroke bg-surface ${className}`}>
      {/* Vệt mờ hai mép — chỉ hiện khi thật sự còn nội dung phía đó. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-surface to-transparent transition-opacity duration-200 ${
          edge.left ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-surface to-transparent transition-opacity duration-200 ${
          edge.right ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={scrollRef}
        onScroll={syncEdge}
        className="scrollbar-thin overflow-x-auto"
        style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
      >
        <table className={`w-full border-collapse text-ink ${variant === "bordered" ? "divide-y divide-stroke" : ""} ${tableClassName}`}>
          {/* KHÔNG `uppercase tracking-wider` (bỏ 19/08/2026, chủ dự án chốt).
              Bảng này ép hoa tiêu đề, còn /admin/customers chạy trên bảng shadcn cũ thì không —
              nên cùng cột "Gói" hiện "GÓI" ở trang này và "Gói" ở trang kia. Đây là nửa còn lại
              của đúng lỗi đã sửa ở nội dung cột "Gói" cùng ngày.
              Chọn bỏ hoa thay vì ép hoa nốt bên kia: tiếng Việt viết hoa toàn bộ mất dấu phụ ở
              một số mặt chữ và đọc chậm hơn, mà tiêu đề bảng thì người ta phải quét bằng mắt.
              Thứ bậc tiêu đề ↔ ô đã có sẵn `font-semibold` + `text-ink-2` lo, không cần chữ hoa. */}
          <thead
            className={`${
              stickyHeader ? "sticky top-0 z-10 bg-surface shadow-xs" : "bg-surface-2"
            } border-b border-stroke text-ink-2`}
          >
            <tr>
              {selectable && (
                <th className={`${headerPadding} w-10 border-r border-stroke-soft/50 text-center ${headPinCheckbox}`}>
                  <Checkbox checked={isAllSelected} indeterminate={isSomeSelected} onChange={handleSelectAll} ariaLabel={t("ds.table_select_all")} />
                </th>
              )}
              {columns.map((col, colIdx) => {
                const isSorted = currentSort?.columnKey === col.key;
                const sortDir = isSorted ? currentSort.direction : null;

                return (
                  <th
                    key={col.key}
                    style={col.width || col.maxWidth ? { width: col.width, maxWidth: col.maxWidth } : undefined}
                    onClick={() => handleHeaderClick(col)}
                    className={`${headerPadding} ${getAlignClass(col.align)} ${
                      col.sortable ? "cursor-pointer select-none transition-colors hover:bg-stroke-soft" : ""
                    } ${variant === "bordered" ? "border-r border-stroke last:border-r-0" : ""} ${pin && colIdx === 0 ? headPinFirst : ""} ${col.hideBelow ? HIDE_BELOW[col.hideBelow] : ""} whitespace-nowrap`}
                  >
                    <div
                      className={`inline-flex items-center space-x-1.5 ${
                        col.align === "right" ? "flex-row-reverse space-x-reverse" : col.align === "center" ? "justify-center" : "justify-start"
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="inline-flex flex-col text-ink-3">
                          {isSorted ? (
                            sortDir === "asc" ? (
                              <ChevronUpIcon className="h-3.5 w-3.5 text-orange" />
                            ) : (
                              <ChevronDownIcon className="h-3.5 w-3.5 text-orange" />
                            )
                          ) : (
                            <ChevronDownIcon className="h-3.5 w-3.5 text-ink-3 opacity-40 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-stroke-soft">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, idx) => (
                <TableSkeletonRow key={idx} columnsCount={columns.length} selectable={selectable} density={density} variant={variant} />
              ))
            ) : sortedData.length === 0 ? (
              <TableEmptyState colSpan={totalCols} icon={emptyIcon} text={emptyText} subtext={emptySubtext} />
            ) : (
              clusteredRows.map(({ row, groupKey, first, last }, rowIdx) => {
                const rowId = getRowId(row, rowIdx);
                const isSelected = selectedRowIds.includes(rowId);

                const bgZebra = variant === "zebra" && rowIdx % 2 === 1 ? "bg-surface-2" : "bg-surface";
                const bgSelected = isSelected ? "bg-orange/5" : "";
                const rowSolidBg = bgZebra;
                const pinCheckbox = pin ? `sticky left-0 z-20 ${rowSolidBg} group-hover:bg-stroke-soft` : "";
                const pinFirst = pin ? `sticky ${firstColLeft} z-20 ${rowSolidBg} border-r border-stroke group-hover:bg-stroke-soft` : "";

                // KHUNG của khối: viền TRÁI ở ô đầu, viền PHẢI ở ô cuối, viền ĐÁY ở dòng cuối. Viền
                // ĐỈNH do dòng tiêu đề bên dưới lo. Vẽ trên `<td>` chứ không trên `<tr>`: trình duyệt
                // bỏ qua `border` đặt trên `<tr>` khi bảng `border-collapse`.
                const inGroup = groupKey != null;
                // Viền trái TRUNG TÍNH, không phải vạch cam dày (07/08). Vạch cam 2px chạy dọc cả
                // khối là màu NHẤN dùng cho việc không mang nghĩa gì: nó không nói "đang chọn",
                // không nói "có lỗi", chỉ nói "mấy dòng này thuộc về nhau" — mà việc đó đường kẻ
                // trung tính làm được, lại không tranh sự chú ý với trạng thái thật trong bảng.
                const gEdgeL = inGroup ? "border-l border-l-stroke" : "";
                const gEdgeR = inGroup ? "border-r border-r-stroke" : "";
                const gEdgeB = inGroup && last ? "border-b border-b-stroke" : "";

                return (
                  <React.Fragment key={String(rowId)}>
                    {inGroup && first && rowGroup && (
                      <tr className="bg-stroke-soft/50">
                        <td
                          colSpan={totalCols}
                          className="border-l border-r border-t border-l-stroke border-r-stroke border-t-stroke px-4 py-2"
                        >
                          {rowGroup.header(groupKey, clusteredRows.filter((c) => c.groupKey === groupKey).map((c) => c.row))}
                        </td>
                      </tr>
                    )}
                    <tr className={`group ${bgZebra} ${bgSelected} transition-colors hover:bg-stroke-soft ${rowClassName?.(row, rowIdx) ?? ""}`}>
                      {selectable && (
                        <td className={`${cellPadding} ${gEdgeL} ${gEdgeB} border-r border-stroke-soft/50 text-center ${pinCheckbox}`}>
                          <Checkbox checked={isSelected} onChange={(checked) => handleSelectRow(rowId, checked)} ariaLabel={`Chọn dòng ${rowIdx + 1}`} />
                        </td>
                      )}
                      {columns.map((col, colIdx) => {
                        const cellValue = col.accessorKey ? row[col.accessorKey] : undefined;
                        const isFirstCell = colIdx === 0 && !selectable;
                        const isLastCell = colIdx === columns.length - 1;

                        return (
                          <td
                            key={col.key}
                            // `maxWidth` phải ở ĐÂY, không chỉ ở `<th>`: trong `table-layout: auto`
                            // chính ô có nội dung dài nhất mới là bên quyết định bề ngang cột.
                            style={col.maxWidth ? { maxWidth: col.maxWidth } : undefined}
                            className={`${cellPadding} ${getAlignClass(col.align)} ${
                              variant === "bordered" ? "border-r border-stroke-soft last:border-r-0" : ""
                            } ${isFirstCell ? gEdgeL : ""} ${isLastCell ? gEdgeR : ""} ${gEdgeB} ${
                              pin && colIdx === 0 ? pinFirst : ""
                            } ${col.hideBelow ? HIDE_BELOW[col.hideBelow] : ""}`}
                          >
                            {col.render
                              ? col.render(row, rowIdx, groupKey != null ? { key: groupKey, first, last } : undefined)
                              : col.type ? renderCellByType(col.type, cellValue) : (cellValue as React.ReactNode) ?? null}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && <TablePagination {...pagination} />}
    </div>
  );
}

/**
 * Ô dựng sẵn KHÔNG nằm ở đây — chúng ở `table-cells.tsx`, và tệp này chỉ dùng lại.
 *
 * Trước 11/08 tệp này tự định nghĩa thêm `TableUserCell` và `TableStatusBadge` trong khi
 * `table-cells.tsx` đã có bản của chúng: hai bản avatar khác nhau (một bo `rounded-lg`, một bo tròn),
 * hai cách lấy chữ viết tắt, hai cỡ chữ. Cả hai đều 0 nơi dùng — nhưng ai mở tệp này ra đọc sẽ gặp
 * bản ở đây trước, và đó là cách một bảng mới lại lệch khỏi các bảng cũ.
 *
 * Xuất lại từ một nguồn để nơi gọi không phải nhớ ô nằm ở tệp nào.
 */
export {
  TableActionsCell,
  TableBooleanCell,
  TableDateCell,
  TableEmptyCell,
  TableFractionCell,
  TableIdentityCell,
  TableLinkCell,
  TableNumberCell,
  TableStatusCell,
  TableTagsCell,
  TableTextCell,
  TableUsageCell,
  TableUserCell,
  TableUserGroupCell,
} from "./table-cells";
