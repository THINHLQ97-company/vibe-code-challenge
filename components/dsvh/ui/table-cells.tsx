"use client";

import { useTranslation } from "@/lib/i18n";
import type { ReactNode } from "react";

import {
  ArrowSquareOutIcon,
  CheckIcon,
  CloseIcon,
  DotsIcon,
} from "@/components/dsvh/icons";
import { statusStyles, type Status } from "@/components/dsvh/status";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { Tag } from "@/components/dsvh/ui/data/Tag";
import { DropdownMenu, type MenuItem } from "@/components/dsvh/ui/overlay/DropdownMenu";
import { Progress } from "@/components/dsvh/ui/Progress";
import { formatDateVN, formatDateTimeVN } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/**
 * Ô BẢNG DỰNG SẴN — bộ mẫu ô dùng chung cho mọi bảng trong app.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * VÌ SAO PHẢI VIẾT LẠI TOÀN BỘ (11/08/2026)
 *
 * Bản trước tồn tại từ lâu, 14 hàm, và ĐO ĐƯỢC: 0 chỗ dùng trong app, 0 khai trong manifest, không
 * xuất hiện ở `/dsvh`. Nó được `INFRA` trong `ds:check` miễn trừ khỏi luật "không có trong manifest
 * = không tồn tại", nên tồn tại mà không ai biết — kể cả trang `Giải phẫu một bảng`, vốn dựng để
 * dạy cách làm ô bảng, cũng viết tay lại đúng 13 mẫu ô đã có sẵn ở đây.
 *
 * Mở ra đọc thì nó không phải kho báu bị bỏ quên. Bốn thứ hỏng thật:
 *
 * 1. **Lỗi hook.** `TableActionsCell` gọi `useState`/`useRef`/`useEffect` nhưng được viết dạng HÀM
 *    THƯỜNG, dùng như `render: (r) => TableActionsCell(items)`. `render` chạy MỘT LẦN MỖI DÒNG bên
 *    trong lượt dựng của `Table`, nên số hook = 3 × số dòng. Lọc hay phân trang làm đổi số dòng là
 *    React vỡ thứ tự hook ("Rendered fewer hooks than expected") — sập cả bảng, không phải lệch
 *    giao diện. Nay mọi ô có trạng thái đều là COMPONENT thật.
 *
 * 2. **Dựng lại thứ DSVH đã có.** Avatar (kể cả nhóm chồng nhau), menu ba chấm, thanh đo — cả ba
 *    đều đã có bản chính (`Avatar`, `DropdownMenu`, `Progress`) mà ở đây tự vẽ lại từ `<img>`,
 *    `<button>` + portal tay, `<svg>` tay. Đúng thứ gate `REIMPL` sinh ra để chặn, chỉ khác là nó
 *    lọt vì file này được miễn trừ.
 *
 * 3. **Ngưỡng màu NGƯỢC nhau giữa hai nơi.** Bản cũ: `<30% đỏ`, `<70% cam`, còn lại teal — tức
 *    THẤP là xấu. `MetricGauge` và bảng ở Trang chủ: `≥90% đỏ`, `≥70% vàng` — tức CAO là xấu. Hai
 *    nghĩa ngược nhau, không chỗ nào nói ra. Nay `TableUsageCell` bắt khai `direction` nên không
 *    thể dùng nhầm hướng mà không thấy.
 *
 * 4. **Sai vai chữ và sai ngôn ngữ.** Ngày để `text-caption` (vai PHỤ) trong khi luật ba vai nói
 *    ngày là vai CHÍNH `text-body`; và in tháng kiểu "Jan/Feb" trong một sản phẩm tiếng Việt.
 *
 * BỎ HẲN, không chuyển sang: `TableRatingCell` (chấm sao 1–5 — không có nghiệp vụ nào trong panel
 * hosting dùng tới) và `TableProgressRingCell` (vòng tròn vẽ SVG tay, vừa phạm luật "không vẽ SVG
 * tay" vừa trùng vai với `MetricGauge` đã có).
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * BA VAI CHỮ TRONG MỘT DÒNG BẢNG — luật nền của cả bộ này:
 *   CHÍNH `text-body`    tên, địa chỉ, NGÀY, con số  → thứ người ta quét mắt tìm
 *   PHỤ   `text-caption` dòng mô tả dưới tên, đơn vị  → thứ chỉ đọc khi đã dừng lại
 *   NHÃN  `Badge`/`Tag`  trạng thái, phân loại        → một cỡ duy nhất trong cùng một bảng
 * KHÔNG có `text-meta`/`text-micro` trong ô bảng (gate TABLETYPE chặn).
 */

/* ─── ô rỗng ────────────────────────────────────────────────────────────────────────────────── */

/** Dấu gạch cho ô không có dữ liệu — để cột không bị "thủng" và người đọc biết là TRỐNG, không phải lỗi. */
export function TableEmptyCell() {
  return <span className="text-body text-ink-3">—</span>;
}

/** Rỗng theo nghĩa "chưa có giá trị" — chuỗi rỗng cũng tính, vì `""` trong ô nhìn y hệt ô hỏng. */
function isBlank(v: unknown) {
  return v === null || v === undefined || v === "";
}

/* ─── chữ ───────────────────────────────────────────────────────────────────────────────────── */

/**
 * Ô chữ thường. `muted` hạ xuống `text-ink-2` cho thông tin phụ trợ NHƯNG vẫn giữ cỡ vai CHÍNH —
 * hạ cỡ chữ là việc của vai, không phải của độ quan trọng.
 */
export function TableTextCell({
  value,
  muted = false,
  truncate = false,
}: {
  value: ReactNode;
  muted?: boolean;
  truncate?: boolean;
}) {
  if (isBlank(value)) return <TableEmptyCell />;
  const title = typeof value === "string" || typeof value === "number" ? String(value) : undefined;
  return (
    <span
      className={cn("text-body", muted ? "text-ink-2" : "text-ink", truncate && "block max-w-full truncate")}
      title={truncate ? title : undefined}
    >
      {value}
    </span>
  );
}

/**
 * Ô ĐỊNH DANH hai dòng: tên (CHÍNH) + mô tả (PHỤ), tuỳ chọn icon/avatar bên trái.
 *
 * Đây là mẫu ô hay bị chép tay nhất — cột đầu của gần như mọi bảng đều là nó.
 */
export function TableIdentityCell({
  title,
  sub,
  leading,
}: {
  title: ReactNode;
  sub?: ReactNode;
  leading?: ReactNode;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {leading ? <span className="shrink-0 text-ink-3">{leading}</span> : null}
      <span className="min-w-0">
        <span className="block truncate text-body font-medium text-ink">{title}</span>
        {sub ? <span className="block truncate text-caption text-ink-2">{sub}</span> : null}
      </span>
    </span>
  );
}

/* ─── số ────────────────────────────────────────────────────────────────────────────────────── */

/**
 * Ô số — canh PHẢI và `tabular-nums` để hàng đơn vị thẳng cột; thiếu hai thứ này thì cột số chỉ còn
 * đọc được từng ô một, không so sánh được theo chiều dọc, và đó là lý do duy nhất người ta xếp số
 * thành cột.
 */
export function TableNumberCell({
  value,
  format = "plain",
  prefix = "",
  suffix = "",
}: {
  value: number | null | undefined;
  format?: "plain" | "currency" | "percent";
  prefix?: string;
  suffix?: string;
}) {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return (
      <div className="text-right">
        <TableEmptyCell />
      </div>
    );
  const text =
    format === "currency"
      ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
      : format === "percent"
        ? `${value}%`
        : value.toLocaleString("vi-VN");
  return (
    <div className="text-right text-body font-medium tabular-nums text-ink">
      {prefix}
      {text}
      {suffix}
    </div>
  );
}

/**
 * Ô PHÂN SỐ (2/5 website, 1/2 tên miền). Hai vế PHẢI cùng cỡ: thu nhỏ mẫu số làm mắt đọc thành hai
 * thông tin khác cấp, trong khi ý nghĩa chỉ có một — "đang dùng bao nhiêu trên tổng bấy nhiêu".
 */
export function TableFractionCell({ used, total }: { used: number; total: number }) {
  return (
    <span className="text-body tabular-nums text-ink">
      {used}
      <span className="text-ink-3">/{total}</span>
    </span>
  );
}

/* ─── ngày ──────────────────────────────────────────────────────────────────────────────────── */

/**
 * Ô ngày — vai CHÍNH (`text-body`), định dạng giờ Việt Nam.
 *
 * `withTime` khi cột nói về việc VỪA XẢY RA (lần chạy, đăng nhập gần nhất); ngày trần cho thứ đổi
 * theo ngày (ngày tạo, hạn gói). In giờ cho một cột "ngày tạo" chỉ thêm 6 ký tự nhiễu vào mọi dòng.
 */
export function TableDateCell({
  value,
  withTime = false,
}: {
  value: string | Date | null | undefined;
  withTime?: boolean;
}) {
  if (isBlank(value)) return <TableEmptyCell />;
  const text = withTime ? formatDateTimeVN(value!) : formatDateVN(value!);
  if (!text) return <TableEmptyCell />;
  return <span className="text-body tabular-nums text-ink">{text}</span>;
}

/* ─── trạng thái & nhãn ─────────────────────────────────────────────────────────────────────── */

/**
 * Ô trạng thái: chấm màu + nhãn chữ. Màu lấy từ MỘT nguồn `status.ts` (luật nền #4) — không tự chế
 * tone ở đây, vì cùng một trạng thái phải cùng màu ở bảng, ở thẻ và ở dải trạng thái.
 *
 * Chấm suy ra từ `statusStyles[...].icon` bằng cách đổi tiền tố `text-` → `bg-`. Bốn giá trị có thật
 * (`text-ink-2`, `text-teal`, `text-amber-strong`, `text-red`) đều có token nền tương ứng — đã đối
 * chiếu với `dsvh-tokens.css`. Thêm status mới thì phải kiểm lại đúng chỗ này.
 */
export function TableStatusCell({ status, label }: { status: Status; label?: string }) {
  const dot = (statusStyles[status]?.icon ?? "text-ink-3").replace("text-", "bg-");
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden />
      {/* `whitespace-nowrap` theo luật 11 (thêm 19/08/2026). Thiếu nó thì nhãn trạng thái dài
          ("Chưa quản hạn", "Đang tạm ngưng") rớt dòng khi cột hẹp và hàng bảng cao so le —
          đúng hậu quả luật 11 nêu tên. Lọt suốt vì luật liệt kê `TableStatusBadge`, một
          component đã bị gộp đi từ 11/08; bản kế nhiệm là ô này thì không ai kiểm lại. */}
      <span className="whitespace-nowrap text-body font-medium text-ink">{label ?? status}</span>
    </span>
  );
}

/** Ô đúng/sai — icon thay cho chữ "Có/Không" khi cột hẹp và giá trị chỉ có hai khả năng. */
export function TableBooleanCell({ value }: { value: boolean | null | undefined }) {
  const { t } = useTranslation();
  if (value === null || value === undefined) return <TableEmptyCell />;
  return value ? (
    <CheckIcon className="inline-block size-4 text-teal" aria-label={t("ds.bool_yes")} />
  ) : (
    <CloseIcon className="inline-block size-4 text-red" aria-label={t("ds.bool_no")} />
  );
}

/**
 * Ô nhiều nhãn phân loại. Dùng `Tag` của DSVH chứ không tự vẽ chip: nhãn trong bảng và nhãn ngoài
 * bảng phải trông như nhau, nếu không người dùng phải học hai lần cùng một quy ước.
 *
 * Quá `max` thì gộp thành `+N` có `title` liệt kê phần còn lại — một dòng bảng không được cao lên
 * chỉ vì một bản ghi có nhiều nhãn hơn các bản ghi khác.
 *
 * KHÔNG rớt dòng (`flex-nowrap`): một chip là đơn vị nguyên khối, và chip rớt xuống dòng thứ hai
 * làm MỌI hàng của bảng cao lên theo hàng cao nhất. Bề ngang đã có `max` + `+N` lo, còn bảng quá
 * chật thì `Table` cuộn ngang — đó mới là cách bảng này được thiết kế để xoay xở (xem `Table`:
 * `<th>` không rớt dòng + vệt mờ hai mép). Đo thật 11/08: để rớt dòng thì hàng cao 111px thay vì 60.
 *
 * Nhận cả chuỗi trần lẫn `{ icon, label }` — CỐ Ý gộp làm một hàm. Tách "chip có icon" thành hàm
 * thứ hai là tự tạo thêm một cặp trùng vai nữa, đúng thứ đợt này sinh ra để dẹp: cùng là "vài nhãn
 * nhỏ trong một ô" thì phải cùng một chỗ quyết cách trình bày.
 */
export type TableTag = string | { icon?: ReactNode; label: string };

export function TableTagsCell({ tags, max = 3 }: { tags: TableTag[]; max?: number }) {
  if (!tags?.length) return <TableEmptyCell />;
  const norm = tags.map((t) => (typeof t === "string" ? { label: t } : t));
  const rest = norm.slice(max);
  return (
    <span className="flex flex-nowrap items-center gap-1.5 whitespace-nowrap">
      {norm.slice(0, max).map((t) => (
        <Tag key={t.label} tone="neutral">
          {t.icon ? <span className="shrink-0 text-ink-3">{t.icon}</span> : null}
          {t.label}
        </Tag>
      ))}
      {rest.length ? (
        <span
          title={rest.join(", ")}
          className="cursor-help rounded-md bg-stroke-soft px-1.5 py-0.5 text-caption font-medium text-ink-2"
        >
          +{rest.length}
        </span>
      ) : null}
    </span>
  );
}

/* ─── mức dùng ──────────────────────────────────────────────────────────────────────────────── */

/**
 * Ô thanh đo có NGƯỠNG.
 *
 * `direction` bắt buộc khai vì hai loại số ngược nhau hoàn toàn:
 *   `"high-bad"`  — mức dùng tài nguyên (RAM, đĩa, CPU): càng đầy càng nguy, ≥90 đỏ · ≥70 cam.
 *   `"low-bad"`   — độ hoàn thành / độ phủ (sao lưu, tiến độ): càng thấp càng nguy, <30 đỏ · <70 cam.
 * Bản cũ chỉ cài sẵn `low-bad` và không nói ra, trong khi mọi bảng tài nguyên trong app cần
 * `high-bad` — dùng nhầm thì một máy chủ sắp đầy đĩa lại hiện màu teal yên tâm.
 */
export function TableUsageCell({
  value,
  direction,
}: {
  value: number;
  direction: "high-bad" | "low-bad";
}) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const tone =
    direction === "high-bad"
      ? pct >= 90
        ? "red"
        : pct >= 70
          ? "orange"
          : "teal"
      : pct < 30
        ? "red"
        : pct < 70
          ? "orange"
          : "teal";
  return (
    <div className="w-full min-w-[120px]">
      <Progress value={pct} tone={tone} showValue size="sm" />
    </div>
  );
}

/* ─── người ─────────────────────────────────────────────────────────────────────────────────── */

/** Ô người dùng: avatar + tên (CHÍNH) + email/vai trò (PHỤ). Avatar lấy bản chính của DSVH. */
export function TableUserCell({ name, sub, src }: { name: string; sub?: string; src?: string | null }) {
  return <TableIdentityCell title={name} sub={sub} leading={<Avatar name={name} src={src} size="sm" />} />;
}

/**
 * Nhóm người chồng nhau +N. Dựng bằng `Avatar` + lớp phủ chứ không tự vẽ `<img>`.
 *
 * `AvatarGroup` đang nằm trong SỔ THIẾU của DSVH — khi nào dựng bản chính thì ô này rút gọn lại
 * thành lời gọi component đó. Ghi ra để việc chuyển tiếp không phụ thuộc trí nhớ.
 */
export function TableUserGroupCell({
  people,
  max = 3,
}: {
  people: { name: string; src?: string | null }[];
  max?: number;
}) {
  if (!people?.length) return <TableEmptyCell />;
  const rest = people.slice(max);
  return (
    <span className="flex items-center -space-x-2">
      {people.slice(0, max).map((p) => (
        <span key={p.name} title={p.name} className="ring-2 ring-surface rounded-full">
          <Avatar name={p.name} src={p.src} size="sm" />
        </span>
      ))}
      {rest.length ? (
        <span
          title={rest.map((p) => p.name).join(", ")}
          className="grid size-8 cursor-help place-items-center rounded-full border border-stroke-soft bg-surface-2 text-caption font-semibold text-ink-2 ring-2 ring-surface"
        >
          +{rest.length}
        </span>
      ) : null}
    </span>
  );
}

/* ─── liên kết & hành động ──────────────────────────────────────────────────────────────────── */

/**
 * Ô liên kết. Mặc định mở TAB MỚI vì phần lớn liên kết trong bảng trỏ ra ngoài app (địa chỉ website
 * đã triển khai) — kéo người dùng rời khỏi danh sách họ đang quét là mất chỗ đang đứng.
 * `external={false}` cho liên kết nội bộ (sang trang chi tiết).
 */
export function TableLinkCell({
  text,
  href,
  external = true,
}: {
  text: string;
  href: string;
  external?: boolean;
}) {
  if (isBlank(text)) return <TableEmptyCell />;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-1 text-body text-link hover:text-link-hover hover:underline"
    >
      {text}
      {external ? <ArrowSquareOutIcon size={12} className="shrink-0" /> : null}
    </a>
  );
}

/**
 * Ô hành động — MỘT nút ba chấm, không phải ba nút icon xếp hàng.
 *
 * Chốt sau lượt rà `/admin/staff` ↔ `/admin/templates`: hai bảng cùng chức năng mà một bên ba nút
 * icon, một bên menu ba chấm. Ba nút icon đội chiều cao dòng lên và bắt người dùng đoán nghĩa từng
 * icon; menu ba chấm giữ dòng gọn và gọi tên hành động bằng chữ.
 *
 * Là COMPONENT thật (không phải hàm gọi trong `render`) — xem mục 1 ở đầu tệp về lỗi hook.
 */
export function TableActionsCell({ items }: { items: MenuItem[] }) {
  if (!items?.length) return <TableEmptyCell />;
  return (
    <div className="flex justify-end">
      <DropdownMenu
        align="end"
        items={items}
        trigger={
          <button
            type="button"
            aria-label="Hành động"
            className="rounded-md border border-transparent p-1.5 text-ink-2 transition-colors hover:border-stroke hover:bg-stroke-soft"
          >
            <DotsIcon className="size-4" />
          </button>
        }
      />
    </div>
  );
}
