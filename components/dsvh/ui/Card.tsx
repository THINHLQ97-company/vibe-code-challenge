"use client";

import { forwardRef, useCallback, useRef, useState, type ReactNode, type Ref } from "react";

import { useTranslation } from "@/lib/i18n";
import { CheckIcon, ChevronDownIcon, DotsIcon, ExportIcon, EyeIcon, GearIcon, RefreshIcon } from "@/components/dsvh/icons";
import { HintTip } from "@/components/dsvh/ui/overlay/HintTip";
import { Tooltip } from "@/components/dsvh/ui/Tooltip";
import { FloatingLayer } from "@/components/dsvh/ui/overlay/FloatingLayer";
import { cn } from "@/lib/utils";

/**
 * Card + phụ kiện của Card/Chart.
 *
 * Trước đây bản VAYS cố ý rút gọn chỉ còn Card + CardHeader, hoãn PeriodPill/KebabButton/LegendDot
 * với lý do "port khi có trang thật cần". Hệ quả: manifest KHAI KHỐNG 3 cái đó suốt (trỏ tới file
 * này nhưng file không hề export) cho tới khi gate kiểm export bắt được — 05/08/2026. Nay port đủ.
 */
/**
 * `forwardRef` (08/08): nơi gọi cần cuộn tới thẻ (`scrollIntoView` sau khi chọn một dòng ở
 * /admin/dashboard) thì phải cầm được DOM node. Trước bản này `Card` nuốt `ref`, nên chỗ đó buộc
 * phải dùng `Card` của shadcn — một component chỉ vì một thuộc tính React tiêu chuẩn.
 */
export const Card = forwardRef<HTMLElement, {
  children: ReactNode;
  className?: string;
  hoverShadow?: boolean;
  hoverLift?: boolean;
  id?: string;
}>(function Card({
  children,
  className = "",
  /**
   * Đổ bóng khi rê chuột — MẶC ĐỊNH TẮT (08/08).
   *
   * Trước bản này mặc định là BẬT, và đó là đặt sai chiều: một cái thẻ là BỀ MẶT TĨNH cho tới khi
   * ai đó nói nó bấm được, không phải ngược lại. Bằng chứng đo được ngay trong repo: 39 chỗ phải
   * viết `` để tắt đi, trong khi số thẻ thật sự bấm được đếm
   * trên đầu ngón tay. Khi cái thường gặp phải khai còn cái hiếm thì im lặng, mặc định đang ngược.
   *
   * Vỡ ra sau đợt 2 bỏ shadcn: `Card` của shadcn KHÔNG có hover, nên 23 tệp vừa chuyển sang đây
   * lặng lẽ mọc thêm hiệu ứng nhấc-lên mà không ai gõ thêm dòng nào — chủ dự án nhìn ra ở
   * /admin/staff. Đổi mặc định vá cả 53 chỗ cùng lúc, thay vì đi dán `={false}` thêm 53 lần.
   *
   * Thẻ bấm được thì BẬT tường minh: `<Card hoverShadow hoverLift>`.
   */
  hoverShadow = false,
  /** Nhấc lên (translate-y) + đổi viền khi rê — luôn đi chung với `hoverShadow`, tắt lẻ một cái
   * nhìn dở dang. Mặc định TẮT, cùng lý do trên. */
  hoverLift = false,
  /** Neo cuộn tới (`#id` từ link ngoài, vd sidebar) — tuỳ chọn, không đổi hành vi mặc định. */
  id,
}, ref) {
  return (
    <section
      ref={ref as Ref<HTMLElement>}
      id={id}
      // `cn()` (twMerge) chứ không nối chuỗi thường — `p-4 ... sm:p-5` gốc PHẢI bị `className` truyền
      // vào đè đúng khi cần override padding (vd StatCard). Nối chuỗi thường không đảm bảo thắng-thua
      // theo thứ tự xuất hiện, mà theo thứ tự trong stylesheet đã biên dịch — cùng bug lớp đã bắt được
      // ở `Input`/`Select`/`Textarea` (`w-full` gốc không bị đè đúng khi ghép className kiểu này).
      className={cn(
        "flex h-full flex-col rounded-card border border-stroke bg-surface p-4 transition-[transform,box-shadow,border-color] duration-300 sm:p-5",
        hoverLift && "hover:-translate-y-[3px] hover:border-stroke-hover",
        hoverShadow && "hover:shadow-[0_16px_44px_-16px_rgba(10,13,20,0.16)]",
        className
      )}
    >
      {children}
    </section>
  );
});

export function CardHeader({
  title,
  subtitle,
  tip,
  icon,
  action,
  titleSub,
}: {
  title: ReactNode;
  /**
   * Dòng mô tả dưới tiêu đề.
   *
   * Thêm 08/08 khi bỏ shadcn đợt 2. `Card` của shadcn có `CardDescription`, DSVH thì không — nên
   * mọi trang cần một dòng mô tả đều tự gõ `<p className="-mt-3 mb-4 text-caption text-ink-2">`
   * NGAY SAU `CardHeader`, đếm được 8 chỗ chép tay. `-mt-3` ở đó là để triệt tiêu `mb-4` của chính
   * `CardHeader` — một con số ma chỉ đúng khi lề dưới của header vẫn là 4. Đưa vào trong thì
   * khoảng cách tiêu đề↔mô tả↔nội dung do MỘT chỗ quyết.
   */
  subtitle?: ReactNode;
  /**
   * Câu BỔ TRỢ — hiện trong tooltip cạnh tiêu đề, không chiếm một dòng dưới thẻ.
   *
   * Khác `subtitle` ở CHỖ ĐỨNG chứ không ở nội dung, và ranh giới là: câu đó có phải thứ người
   * đọc cần thấy MỖI LẦN mở thẻ không?
   *   · CÓ  → `subtitle`. Vd "34 khách hàng" — số bản ghi là một phần của việc đọc bảng.
   *   · KHÔNG → `tip`. Vd giải thích "nền là gì, tuỳ chỉnh là gì" ở /admin/ai-rules: đọc một lần
   *     là hiểu, để nó nằm đó vĩnh viễn thì mỗi lần vào lại phải lướt qua ba dòng chữ xám mới tới
   *     được bảng.
   *
   * Chốt 20/08/2026 (chủ dự án): "nội dung ở dưới bản chất không phải content mà là nội dung bổ
   * trợ, vì thế kế bên tiêu đề phải có icon và thể hiện tooltip".
   *
   * ĐỔI TÊN `hint` → `tip` (26/08/2026). DSVH đang gọi `hint` cho HAI thứ: ở đây là tooltip, ở
   * `FormField` là dòng chữ hiện sẵn dưới ô nhập. Đếm nơi gọi rồi mới chọn: dạng dòng-hiện 10+ chỗ,
   * dạng tooltip 3 chỗ — nên `hint` giữ nghĩa dòng-hiện, tooltip đổi hết sang `tip` ở cả hai.
   */
  tip?: ReactNode;
  /** Icon đứng TRƯỚC title, anh em riêng với <h3> — KHÔNG nhét vào `title`. Nhét
   * chung sẽ bị `truncate` (overflow:hidden trên h3) bóp icon gần về 0px khi Card
   * hẹp — bắt được thật ở admin-automation "Khoá API" (icon lúc ẩn lúc hiện). */
  icon?: ReactNode;
  action?: ReactNode;
  /**
   * Dòng phụ NẰM TRONG cụm `icon + title` — khác `subtitle` ở CHỖ ĐỨNG và ở LOẠI NỘI DUNG.
   *
   * `subtitle` là câu nói về CẢ THẺ, nên nó canh mép trái thẻ (chốt 17/08/2026: bản thụt vào "tạo
   * cảm giác vỡ UI"). Quyết định đó KHÔNG đổi.
   *
   * `titleSub` là THUỘC TÍNH CỦA CHÍNH CÁI TÊN ở trên nó — "thêm ngày nào", "thuộc gói nào" — đúng
   * khuôn `TableIdentityCell` (tên CHÍNH + mô tả PHỤ) mà bảng đã dùng từ lâu. Thứ đó phải thụt theo
   * tên, vì tách ra mép trái là biến một thuộc tính thành một câu độc lập.
   *
   * Có `titleSub` thì `<h3>` bỏ `truncate` và chuyển sang khối hai dòng — `truncate` ép
   * `white-space: nowrap`, dòng phụ sẽ nằm đè lên cùng một dòng với tên.
   */
  titleSub?: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    /**
     * MÔ TẢ NẰM DƯỚI CẢ HÀNG, CANH MÉP TRÁI THẺ — đổi 17/08/2026 theo chốt của chủ dự án.
     *
     * Bản trước đặt `subtitle` bên trong cụm `icon + title`, nên khi thẻ CÓ icon thì mô tả bị thụt
     * vào ngang chữ tiêu đề (qua khỏi icon). Đo ở /profile/security: lệch 26px so với thẻ dùng khuôn
     * cũ ngay bên cạnh. Chủ dự án xem cả hai và chốt bản canh mép trái — bản thụt vào "tạo cảm giác
     * vỡ UI", vì mô tả là câu nói về CẢ THẺ chứ không phải phần phụ của cái tiêu đề.
     *
     * Sửa ở ĐÂY chứ không ở nơi gọi: khuôn `<p className="-mt-3 mb-4">` viết tay từng tồn tại song
     * song đúng vì lý do này, và nó là thứ `subtitle` sinh ra để xoá. Quay lại nó là dựng lại hai
     * đường cho một việc.
     *
     * Chỉ 9 thẻ đổi hình (những thẻ có CẢ `icon` lẫn `subtitle`); thẻ không icon vốn đã canh mép
     * trái sẵn nên không đổi gì.
     */
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {icon && <span className="shrink-0 text-ink">{icon}</span>}
          {titleSub ? (
            <span className="min-w-0">
              <h3 className="truncate text-title font-semibold tracking-tight text-ink">{title}</h3>
              <span className="block truncate text-caption font-normal text-ink-3">{titleSub}</span>
            </span>
          ) : (
            <h3 className="truncate text-title font-semibold tracking-tight text-ink">
              {title}
            </h3>
          )}
          {tip ? <HintTip content={tip} /> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      </div>
      {subtitle ? <p className="mt-1 text-caption text-ink-2">{subtitle}</p> : null}
    </div>
  );
}

const DEFAULT_PERIOD_OPTIONS = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last Month",
  "Last 3 Months",
  "This Year",
  "All Time",
];

/** Shape riêng của menu kebab trên Card — KHÁC `MenuItem` của DropdownMenu (bên đó là union có
 *  nhánh `separator` và dùng `onSelect`). Giữ tên riêng để hai thứ không lẫn vào nhau. */
type KebabItem = {
  label: string;
  icon?: ReactNode;
  action?: () => void;
  danger?: boolean;
};

const DEFAULT_KEBAB_ITEMS: KebabItem[] = [
  { label: "Refresh Data", icon: <RefreshIcon width={15} height={15} /> },
  { label: "Export CSV", icon: <ExportIcon width={15} height={15} /> },
  { label: "View Details", icon: <EyeIcon width={15} height={15} /> },
  { label: "Card Settings", icon: <GearIcon width={15} height={15} /> },
];

export function PeriodPill({
  label = "Last Month",
  options = DEFAULT_PERIOD_OPTIONS,
  onChange,
}: {
  label?: string;
  options?: string[];
  onChange?: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(label);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    onChange?.(option);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-stroke bg-surface px-2.5 py-1.5 text-caption font-medium text-ink-2 transition-all duration-200 hover:border-stroke-hover hover:bg-stroke-soft active:scale-[0.97] ${
          isOpen ? "border-stroke-hover bg-stroke-soft ring-2 ring-orange/10" : ""
        }`}
      >
        <span>{selected}</span>
        <ChevronDownIcon
          width={15}
          height={15}
          className={`text-ink-3 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <FloatingLayer
        anchorRef={containerRef}
        open={isOpen}
        onClose={close}
        side="bottom"
        align="end"
        role="listbox"
        className="min-w-[150px] overflow-hidden rounded-xl border border-stroke bg-surface p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95"
      >
          {options.map((opt) => {
            const isSelected = opt === selected;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-caption font-medium transition-colors ${
                  isSelected
                    ? "bg-stroke-soft font-semibold text-ink"
                    : "text-ink-2 hover:bg-stroke-soft hover:text-ink"
                }`}
              >
                <span>{opt}</span>
                {isSelected && (
                  <CheckIcon width={14} height={14} className="text-orange" />
                )}
              </button>
            );
          })}
      </FloatingLayer>
    </div>
  );
}

export function IconGhostButton({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-9 place-items-center rounded-lg border border-stroke bg-surface text-ink-2 transition-colors hover:border-stroke-hover hover:bg-stroke-soft active:scale-[0.97] ${
        active ? "border-stroke-hover bg-stroke-soft" : ""
      }`}
    >
      {children}
    </button>
  );
}


export function KebabButton({
  items = DEFAULT_KEBAB_ITEMS,
}: {
  items?: KebabItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <IconGhostButton
        label="More options"
        onClick={() => setIsOpen(!isOpen)}
        active={isOpen}
      >
        <DotsIcon width={18} height={18} />
      </IconGhostButton>

      <FloatingLayer
        anchorRef={containerRef}
        open={isOpen}
        onClose={close}
        side="bottom"
        align="end"
        role="menu"
        className="w-44 overflow-hidden rounded-xl border border-stroke bg-surface p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95"
      >
          {items.map((item, idx) => (
            <button
              key={item.label || idx}
              type="button"
              onClick={() => {
                setIsOpen(false);
                item.action?.();
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-caption font-medium transition-colors ${
                item.danger
                  ? "text-red hover:bg-red/10"
                  : "text-ink-2 hover:bg-stroke-soft hover:text-ink"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
      </FloatingLayer>
    </div>
  );
}

export function TileKebabDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        aria-label="More options"
        onClick={() => setIsOpen(!isOpen)}
        className={`grid size-6 place-items-center rounded-md text-ink-3 transition-colors hover:bg-stroke-soft ${
          isOpen ? "bg-stroke-soft text-ink" : ""
        }`}
      >
        <DotsIcon width={16} height={16} />
      </button>

      <FloatingLayer
        anchorRef={containerRef}
        open={isOpen}
        onClose={close}
        side="bottom"
        align="end"
        role="menu"
        className="w-40 overflow-hidden rounded-xl border border-stroke bg-surface p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95"
      >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-caption font-medium text-ink-2 hover:bg-stroke-soft hover:text-ink"
          >
            <RefreshIcon width={14} height={14} />
            <span>Refresh Tile</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-caption font-medium text-ink-2 hover:bg-stroke-soft hover:text-ink"
          >
            <ExportIcon width={14} height={14} />
            <span>Export Data</span>
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-caption font-medium text-ink-2 hover:bg-stroke-soft hover:text-ink"
          >
            <EyeIcon width={14} height={14} />
            <span>View Logs</span>
          </button>
      </FloatingLayer>
    </div>
  );
}

export function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-caption font-medium text-ink-2">
      <span
        className="size-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
