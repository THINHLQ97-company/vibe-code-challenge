"use client";

import { useMemo, useState, type ReactNode } from "react";

import {
  CpuIcon,
  GearIcon,
  GlobeIcon,
  MemoryIcon,
  ShieldCheckIcon,
  StackIcon,
} from "@/components/dsvh/icons";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Input } from "@/components/dsvh/ui/Input";
import { Select } from "@/components/dsvh/ui/form/Select";
import { Switch } from "@/components/dsvh/ui/form/Switch";
import { Table, type ColumnDef, type SortState } from "@/components/dsvh/ui/Table";
import { TreeRow } from "@/components/dsvh/ui/data/TreeGuide";
import {
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
} from "@/components/dsvh/ui/table-cells";

/**
 * BẢNG — tài liệu ba tầng, nằm ngay trong trang `Table`.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * VÌ SAO DỰNG LẠI TOÀN BỘ (12/08/2026)
 *
 * Bản trước là MỘT bảng mười cột kèm mười ba chú giải đánh số ở dưới. Muốn biết "ô ngày làm thế
 * nào" thì phải đọc số 9 trong danh sách rồi dò ngược lên bảng đếm cột — không ai làm thế. Tệ hơn:
 * mười bốn ô dựng sẵn được liệt kê thành mười bốn THẺ CHỮ, KHÔNG ô nào có demo. Chủ dự án hỏi đúng
 * câu đó: "table tệp con ở dưới tại sao lại ko có demo".
 *
 * Nay ba tầng, đọc từ trên xuống đúng thứ tự người ta cần:
 *   ① BẢNG CƠ BẢN   — thứ MỌI bảng đều phải có: hover · sắp xếp · không rớt dòng · bốn trạng thái.
 *   ② Ô CHUYÊN DỤNG — mỗi ô một demo CHẠY THẬT, đứng cạnh luật của chính nó.
 *   ③ BẢNG NÂNG CAO — ghép hết lại thành đúng bảng đang chạy ở sản phẩm.
 *
 * ─────────────────────────────────────────────────────────────────────────────────────────────
 * LUẬT KHÔNG RỚT DÒNG (chốt 12/08)
 *
 * Ô bảng KHÔNG BAO GIỜ xuống dòng, trên mọi cỡ máy. Chật thì người dùng KÉO NGANG — bảng có vệt mờ
 * hai mép báo còn nội dung. Lý do: một dòng bảng là MỘT bản ghi; cho nó cao hai ba dòng thì mọi
 * hàng khác cao theo hàng cao nhất, và mắt mất khả năng quét dọc — thứ duy nhất khiến bảng hơn một
 * danh sách.
 *
 * Hệ quả: tài liệu này KHÔNG dùng `hideBelow`. Prop đó vẫn còn trong `Table` cho bảng nào thật sự
 * cần, nhưng ẩn cột là GIẤU dữ liệu — tài liệu dạy đúng một cách: kéo ngang.
 */

/* ─── dữ liệu mẫu, dùng chung cả ba tầng ─────────────────────────────────────────────────────── */

type Row = {
  id: string;
  name: string;
  sub: string;
  url: string;
  tag: string;
  cpu: string;
  ram: string;
  status: "online" | "error";
  used: number;
  quota: number;
  on: boolean;
  date: string;
  group?: string;
  order?: string;
};

const ROWS: Row[] = [
  { id: "1", name: "app-xa0hpo-backend", sub: "Máy chủ API", url: "app-xa0hpo-backend.b.matbao.ai", tag: "Giám sát", cpu: "0.2 core", ram: "128MB", status: "online", used: 1, quota: 2, on: true, date: "2026-08-06", group: "g1", order: "1/2" },
  { id: "2", name: "app-xa0hpo", sub: "Giao diện", url: "app-xa0hpo.b.matbao.ai", tag: "Tiện ích", cpu: "0.3 core", ram: "256MB", status: "online", used: 2, quota: 2, on: true, date: "2026-08-06", group: "g1", order: "2/2" },
  { id: "3", name: "test-file", sub: "Dán HTML", url: "test-file-html.b.matbao.ai", tag: "Bảo mật", cpu: "0.7 core", ram: "1GB", status: "error", used: 0, quota: 2, on: false, date: "2026-08-04" },
];

const one = ROWS.slice(0, 2);
const rid = (r: Row) => r.id;

/* ─── khối trình bày ─────────────────────────────────────────────────────────────────────────── */

function Tier({ n, title, desc, children }: { n: number; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex items-start gap-3">
        {/* Số tầng giữ TRUNG TÍNH (luật #8): nó đánh dấu vị trí trong tài liệu, không phải trạng thái. */}
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-stroke-soft text-caption font-semibold text-ink-2">
          {n}
        </span>
        <div className="min-w-0">
          <h3 className="text-title font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 max-w-3xl text-caption leading-relaxed text-ink-3">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

/** Bảng nhỏ cho một demo ô — vẫn là `Table` THẬT, không phải `<table>` giả dựng cho đẹp. */
function Mini<T>({ data, columns, getRowId }: { data: T[]; columns: ColumnDef<T>[]; getRowId: (r: T) => string }) {
  return <Table<T> data={data} columns={columns} getRowId={getRowId} density="compact" />;
}

/**
 * Một ô chuyên dụng: DEMO CHẠY THẬT bên trái, luật + cách gọi bên phải.
 *
 * Demo đứng trước chữ vì người ta nhận ra thứ mình cần bằng mắt nhanh hơn bằng đọc — và đây đúng
 * là thứ bản trước thiếu: mười bốn thẻ chữ không có gì để nhìn.
 */
function CellDoc({
  name,
  when,
  rule,
  code,
  children,
}: {
  name: string;
  when: string;
  rule?: string;
  code: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stroke bg-surface p-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="min-w-0 rounded-lg border border-stroke-soft bg-surface-2 p-3">{children}</div>
        <div className="min-w-0">
          <code className="text-caption font-semibold text-ink">{name}</code>
          <p className="mt-1 text-caption leading-relaxed text-ink-2">{when}</p>
          {rule ? (
            <p className="mt-1.5 border-l-2 border-orange pl-2 text-caption leading-relaxed text-ink-2">{rule}</p>
          ) : null}
          <pre className="mt-2 overflow-x-auto rounded-md bg-stroke-soft p-2">
            <code className="text-caption text-ink-2">{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ─── ① BẢNG CƠ BẢN ──────────────────────────────────────────────────────────────────────────── */

type Basic = { id: string; ten: string; goi: string; ram: number };
const BASIC: Basic[] = [
  { id: "b1", ten: "matbao-blog", goi: "Pro", ram: 512 },
  { id: "b2", ten: "api-gateway", goi: "Free", ram: 256 },
  { id: "b3", ten: "docs-site", goi: "Pro", ram: 1024 },
];

function BasicTable() {
  const [sort, setSort] = useState<SortState | null>({ columnKey: "ten", direction: "asc" });
  const [chon, setChon] = useState<(string | number)[]>([]);
  const [trang, setTrang] = useState(1);

  /* Sắp xếp làm Ở NGOÀI chứ không để `Table` tự làm: bảng thật gần như luôn sắp ở MÁY CHỦ (dữ liệu
     nhiều hơn một trang), nên `Table` chỉ nhận `sortState` và báo `onSortChange` ra. Demo phải
     giống cách dùng thật, nếu không người đọc chép về sẽ hụt đúng mắt xích đó. */
  const rows = useMemo(() => {
    if (!sort) return BASIC;
    const d = sort.direction === "asc" ? 1 : -1;
    return [...BASIC].sort((a, b) =>
      sort.columnKey === "ram" ? (a.ram - b.ram) * d : a.ten.localeCompare(b.ten, "vi") * d,
    );
  }, [sort]);

  const columns: ColumnDef<Basic>[] = [
    { key: "ten", header: "Tên", sortable: true, render: (r) => <TableTextCell value={r.ten} /> },
    { key: "goi", header: "Gói", render: (r) => <Badge tone={r.goi === "Pro" ? "accent" : "neutral"}>{r.goi}</Badge> },
    { key: "ram", header: "RAM", sortable: true, align: "right", render: (r) => <TableNumberCell value={r.ram} suffix="MB" /> },
    { key: "ngay", header: "Ngày tạo", render: () => <TableDateCell value="2026-08-06" /> },
  ];

  return (
    <div className="space-y-3">
      <Table<Basic>
        data={rows}
        getRowId={(r) => r.id}
        columns={columns}
        sortState={sort}
        onSortChange={setSort}
        selectable
        selectedRowIds={chon}
        onSelectionChange={setChon}
        stickyHeader
        pagination={{ currentPage: trang, totalPages: 3, totalRows: 9, pageSize: 3, onPageChange: setTrang }}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-stroke-soft bg-surface-2 p-2.5 text-caption leading-relaxed text-ink-2">
          <strong className="text-ink">Bấm tiêu đề để sắp xếp.</strong> Cột chữ A→Z rồi Z→A; cột số
          nhỏ→lớn rồi lớn→nhỏ. Mũi tên ở tiêu đề cho biết đang sắp theo cột nào, chiều nào.
        </p>
        <p className="rounded-lg border border-stroke-soft bg-surface-2 p-2.5 text-caption leading-relaxed text-ink-2">
          <strong className="text-ink">Rê chuột lên một dòng</strong> để thấy nền đổi — dấu duy nhất cho
          biết dòng nào đang được nhắm khi bảng dài.
        </p>
      </div>
    </div>
  );
}

function StatesRow() {
  const cols: ColumnDef<Basic>[] = [
    { key: "ten", header: "Tên", render: (r) => <TableTextCell value={r.ten} /> },
    { key: "ram", header: "RAM", align: "right", render: (r) => <TableNumberCell value={r.ram} suffix="MB" /> },
  ];
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div>
        <p className="mb-1.5 text-caption font-medium text-ink-2">Đang tải</p>
        <Table<Basic> data={[]} columns={cols} getRowId={(r) => r.id} loading density="compact" />
      </div>
      <div>
        <p className="mb-1.5 text-caption font-medium text-ink-2">Không có dữ liệu</p>
        {/* Trạng thái rỗng phải phân biệt CHƯA CÓ GÌ với BỘ LỌC KHÔNG KHỚP — hai câu khác nhau và
            hai hành động khác nhau. Đây là chỗ người dùng mắc kẹt nhiều nhất. */}
        <Table<Basic>
          data={[]}
          columns={cols}
          getRowId={(r) => r.id}
          density="compact"
          emptyText="Chưa có website nào"
          emptySubtext="Tạo website đầu tiên để bắt đầu"
        />
      </div>
    </div>
  );
}

/* ─── ② Ô CHUYÊN DỤNG — mỗi ô một demo ───────────────────────────────────────────────────────── */

/**
 * Demo của TỪNG ô, tách riêng để trang của chính ô đó (`/dsvh/TableUsageCell`) dùng lại — một
 * nguồn, hiện ở hai chỗ. Trước bản này trang ô hoàn toàn không có gì để nhìn.
 */
export const tableCellDemos: Record<string, () => ReactNode> = {
  TableIdentityCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[{ key: "n", header: "Website", render: (r) => <TableIdentityCell title={r.name} sub={r.sub} leading={<GlobeIcon className="size-4" />} /> }]}
    />
  ),
  TableTextCell: () => (
    <Mini<Row> data={one} getRowId={rid} columns={[{ key: "t", header: "Ghi chú", render: (r) => <TableTextCell value={r.sub} /> }]} />
  ),
  TableLinkCell: () => (
    <Mini<Row> data={one} getRowId={rid} columns={[{ key: "u", header: "Địa chỉ", render: (r) => <TableLinkCell text={r.url} href={`https://${r.url}`} /> }]} />
  ),
  TableTagsCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[
        { key: "p", header: "Phân loại", render: (r) => <TableTagsCell tags={[{ icon: <ShieldCheckIcon size={12} />, label: r.tag }]} /> },
        { key: "r", header: "Tài nguyên", render: (r) => <TableTagsCell tags={[{ icon: <CpuIcon size={12} />, label: r.cpu }, { icon: <MemoryIcon size={12} />, label: r.ram }]} /> },
      ]}
    />
  ),
  TableFractionCell: () => (
    <Mini<Row> data={one} getRowId={rid} columns={[{ key: "d", header: "Dịch vụ", render: (r) => <TableFractionCell used={r.used} total={r.quota} /> }]} />
  ),
  TableUsageCell: () => (
    <Mini<Row>
      data={ROWS}
      getRowId={rid}
      columns={[{ key: "m", header: "Mức dùng", render: (r) => <TableUsageCell value={Math.round((r.used / r.quota) * 100)} direction="high-bad" /> }]}
    />
  ),
  TableStatusCell: () => (
    <Mini<Row>
      data={ROWS}
      getRowId={rid}
      columns={[{ key: "s", header: "Trạng thái", render: (r) => <TableStatusCell status={r.status === "online" ? "success" : "error"} label={r.status === "online" ? "Trực tuyến" : "Lỗi"} /> }]}
    />
  ),
  TableBooleanCell: () => (
    <Mini<Row> data={ROWS} getRowId={rid} columns={[{ key: "b", header: "Đã bật", render: (r) => <TableBooleanCell value={r.on} /> }]} />
  ),
  TableDateCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[
        { key: "d1", header: "Ngày tạo", render: (r) => <TableDateCell value={r.date} /> },
        { key: "d2", header: "Chạy gần nhất", render: (r) => <TableDateCell value={`${r.date}T09:12:00`} withTime /> },
      ]}
    />
  ),
  TableNumberCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[
        { key: "n1", header: "Lượt truy cập", align: "right", render: () => <TableNumberCell value={128450} /> },
        { key: "n2", header: "Phí tháng", align: "right", render: () => <TableNumberCell value={250000} format="currency" /> },
      ]}
    />
  ),
  TableUserCell: () => (
    <Mini<Row> data={one} getRowId={rid} columns={[{ key: "u", header: "Người tạo", render: () => <TableUserCell name="Trần Anh Tú" sub="tuta@matbao.com" /> }]} />
  ),
  TableUserGroupCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[{ key: "g", header: "Tham gia", render: () => <TableUserGroupCell people={[{ name: "An" }, { name: "Bình" }, { name: "Cường" }, { name: "Dũng" }]} /> }]}
    />
  ),
  TableActionsCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[{ key: "a", header: "Thao tác", align: "right", render: () => <TableActionsCell items={[{ label: "Quản lý", icon: <GearIcon size={16} /> }, { label: "Xoá", icon: <StackIcon size={16} />, danger: true }]} /> }]}
    />
  ),
  TableEmptyCell: () => (
    <Mini<Row>
      data={one}
      getRowId={rid}
      columns={[{ key: "e", header: "Miền riêng", render: (r) => (r.id === "1" ? <TableTextCell value="matbao.com" /> : <TableEmptyCell />) }]}
    />
  ),
};

const CELL_DOCS: { name: string; when: string; rule?: string; code: string }[] = [
  { name: "TableIdentityCell", when: "Cột ĐẦU của gần như mọi bảng: tên (vai CHÍNH) + mô tả (vai PHỤ), tuỳ chọn icon bên trái.", rule: "Đây là ô hay bị chép tay nhất — chép tay là lúc cỡ chữ hai dòng bắt đầu lệch giữa các bảng.", code: '<TableIdentityCell title={r.name} sub={r.sub}\n  leading={<GlobeIcon className="size-4" />} />' },
  { name: "TableTextCell", when: "Giá trị chữ không có cấu trúc gì thêm.", rule: "Cần bớt nổi thì dùng `muted` (đổi MÀU), đừng hạ cỡ chữ — hạ cỡ là việc của vai, không phải của độ quan trọng.", code: "<TableTextCell value={r.sub} muted truncate />" },
  { name: "TableLinkCell", when: "Địa chỉ website đã triển khai, liên kết ra ngoài.", rule: "Mặc định mở tab mới — kéo người dùng rời khỏi danh sách họ đang quét là làm mất chỗ đang đứng.", code: "<TableLinkCell text={r.url}\n  href={`https://${r.url}`} />" },
  { name: "TableTagsCell", when: "Phân loại, thông số ngắn, danh sách ngắn trong một ô. Nhận cả chuỗi trần lẫn chip có icon.", rule: "KHÔNG rớt dòng: quá `max` thì gộp thành +N. Một dòng bảng không được cao lên chỉ vì một bản ghi có nhiều nhãn hơn.", code: "<TableTagsCell max={3} tags={[\n  { icon: <CpuIcon size={12} />, label: r.cpu },\n]} />" },
  { name: "TableFractionCell", when: "Đang dùng bao nhiêu trên tổng bấy nhiêu (website, tên miền, chỗ ngồi).", rule: "Hai vế CÙNG cỡ. Thu nhỏ mẫu số làm mắt đọc ra hai thông tin khác cấp, trong khi ý nghĩa chỉ có một.", code: "<TableFractionCell used={r.used} total={r.quota} />" },
  { name: "TableUsageCell", when: "Thanh đo có ngưỡng màu.", rule: "BẮT BUỘC khai `direction`. `high-bad` cho mức dùng tài nguyên (≥90 đỏ · ≥70 cam); `low-bad` cho độ hoàn thành. Nhầm hướng thì máy chủ sắp đầy đĩa lại hiện teal yên tâm.", code: '<TableUsageCell value={82} direction="high-bad" />' },
  { name: "TableStatusCell", when: "Trạng thái vận hành: chấm màu + nhãn chữ.", rule: "Tone lấy từ MỘT nguồn `status.ts` — cùng một trạng thái phải cùng màu ở bảng, ở thẻ và ở dải trạng thái.", code: '<TableStatusCell status="success"\n  label="Trực tuyến" />' },
  { name: "TableBooleanCell", when: "Cột hẹp mà giá trị chỉ có hai khả năng.", rule: "Có sắc thái hơn hai mức thì dùng `Badge`, không dùng ô này.", code: "<TableBooleanCell value={r.on} />" },
  { name: "TableDateCell", when: "Mọi cột ngày. `withTime` cho việc VỪA xảy ra; ngày trần cho thứ đổi theo ngày.", rule: "Ngày là vai CHÍNH (14px), không phải chú thích — người ta quét mắt để SO. Không kèm icon lịch: tiêu đề cột đã nói đó là ngày.", code: "<TableDateCell value={r.date} />\n<TableDateCell value={r.at} withTime />" },
  { name: "TableNumberCell", when: "Mọi cột số, kể cả tiền.", rule: "Canh PHẢI + `tabular-nums` — đó là điều kiện để so sánh theo chiều dọc, lý do duy nhất người ta xếp số thành cột.", code: '<TableNumberCell value={250000}\n  format="currency" />' },
  { name: "TableUserCell", when: "Bảng nhân sự, khách hàng, người thao tác.", code: '<TableUserCell name="Trần Anh Tú"\n  sub="tuta@matbao.com" />' },
  { name: "TableUserGroupCell", when: "Cột “ai đang tham gia” — avatar chồng nhau, quá `max` thì +N.", code: "<TableUserGroupCell people={people} max={3} />" },
  { name: "TableActionsCell", when: "Mọi cột thao tác.", rule: "MỘT menu ba chấm, KHÔNG ba nút icon xếp hàng: chúng đội chiều cao dòng và bắt đoán nghĩa icon, còn menu gọi tên hành động bằng chữ.", code: '<TableActionsCell items={[\n  { label: "Xoá", danger: true, onSelect: del },\n]} />' },
  { name: "TableEmptyCell", when: "Ô không có dữ liệu.", rule: "Để cột không bị “thủng” và người đọc biết là TRỐNG chứ không phải lỗi. Các ô khác tự gọi khi giá trị rỗng.", code: "<TableEmptyCell />" },
];

/* ─── ③ BẢNG NÂNG CAO ────────────────────────────────────────────────────────────────────────── */

function AdvancedTable() {
  const [q, setQ] = useState("");
  const [loc, setLoc] = useState("all");
  const [on, setOn] = useState<Record<string, boolean>>({ "1": true, "2": true, "3": false });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-title font-semibold text-ink">Danh sách website</p>
          <p className="mt-0.5 text-caption text-ink-2">3 website đang triển khai</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <Input placeholder="Tìm website…" value={q} onChange={(e) => setQ(e.target.value)} className="w-auto min-w-[220px]" />
          <Select
            value={loc}
            onChange={setLoc}
            className="w-auto min-w-[160px]"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "online", label: "Trực tuyến" },
              { value: "error", label: "Lỗi" },
            ]}
          />
        </div>
      </div>

      <Table<Row>
        data={ROWS}
        getRowId={rid}
        columns={[
          {
            key: "name",
            header: "Website",
            sortable: true,
            render: (r, _i, group) => {
              const body = (
                <>
                  <TableIdentityCell title={r.name} sub={r.sub} />
                  {r.order && (
                    <span className="shrink-0 whitespace-nowrap rounded-sm bg-stroke-soft px-1.5 py-0.5 text-caption tabular-nums text-ink-2">
                      {r.order}
                    </span>
                  )}
                </>
              );
              /* Dòng con mang nét nối cây, dòng đứng riêng mang icon — để hai loại dòng NGANG CẤP
                 vẫn thẳng cột. */
              return group ? (
                <TreeRow last={group.last} className="-my-3">
                  {body}
                </TreeRow>
              ) : (
                <span className="flex items-center gap-2">
                  <GlobeIcon className="size-4 shrink-0 text-ink-3" aria-hidden />
                  {body}
                </span>
              );
            },
          },
          { key: "url", header: "Địa chỉ", render: (r) => <TableLinkCell text={r.url} href={`https://${r.url}`} /> },
          { key: "tag", header: "Phân loại", render: (r) => <TableTagsCell tags={[{ icon: <ShieldCheckIcon size={12} />, label: r.tag }]} /> },
          {
            key: "res",
            header: "Tài nguyên",
            render: (r) => (
              <TableTagsCell tags={[{ icon: <CpuIcon size={12} />, label: r.cpu }, { icon: <MemoryIcon size={12} />, label: r.ram }]} />
            ),
          },
          { key: "quota", header: "Dịch vụ", render: (r) => <TableFractionCell used={r.used} total={r.quota} /> },
          { key: "bar", header: "Mức dùng", render: (r) => <TableUsageCell value={Math.round((r.used / r.quota) * 100)} direction="high-bad" /> },
          {
            key: "status",
            header: "Trạng thái",
            render: (r) => (
              <Badge tone={r.status === "online" ? "success" : "danger"}>
                {r.status === "online" ? "Trực tuyến" : "Lỗi"}
              </Badge>
            ),
          },
          {
            key: "on",
            header: "Bật",
            render: (r) => (
              <Switch size="sm" checked={on[r.id] ?? r.on} onChange={(v) => setOn((s) => ({ ...s, [r.id]: v }))} aria-label={`Bật ${r.name}`} />
            ),
          },
          { key: "date", header: "Ngày tạo", render: (r) => <TableDateCell value={r.date} /> },
          {
            key: "actions",
            header: "Thao tác",
            align: "right",
            render: () => (
              <TableActionsCell items={[{ label: "Quản lý", icon: <GearIcon size={16} /> }, { label: "Xoá", icon: <StackIcon size={16} />, danger: true }]} />
            ),
          },
        ]}
        rowGroup={{
          keyOf: (r) => r.group ?? null,
          header: (_k, rows) => (
            <span className="flex flex-wrap items-center gap-2">
              <StackIcon className="size-4 shrink-0 text-ink-2" aria-hidden />
              <span className="text-body font-medium text-ink">{rows[0]?.name.replace("-backend", "")}</span>
              <span className="text-body text-ink-2">đang chạy {rows.length}/{rows.length} thành phần</span>
            </span>
          ),
        }}
        pagination={{ currentPage: 1, totalPages: 4, totalRows: 19, pageSize: 5, onPageChange: () => {} }}
      />
    </div>
  );
}

/* ─── trang ──────────────────────────────────────────────────────────────────────────────────── */

export function TableAnatomy() {
  return (
    <section className="mb-5 rounded-card border border-stroke bg-surface p-5">
      <h2 className="mb-1 text-title font-semibold text-ink">Giải phẫu một bảng</h2>
      <p className="mb-4 max-w-3xl text-caption leading-relaxed text-ink-3">
        Ba tầng, đọc từ trên xuống. Dựng bảng mới thì bắt đầu ở tầng 1, lấy ô ở tầng 2; tầng 3 là bằng
        chứng hai tầng trên ghép ra được đúng bảng đang chạy ở sản phẩm.
      </p>

      <div className="mb-5 rounded-lg border-y border-r border-l-2 border-y-stroke border-l-orange border-r-stroke bg-surface-2 p-3">
        <p className="text-caption font-semibold text-ink">Luật nền: ô bảng KHÔNG BAO GIỜ rớt dòng</p>
        <p className="mt-1 text-caption leading-relaxed text-ink-2">
          Trên mọi cỡ máy. Chật thì người dùng <strong className="text-ink">kéo ngang</strong> — bảng có
          vệt mờ hai mép báo còn nội dung. Lý do: một dòng bảng là MỘT bản ghi; cho nó cao hai ba dòng
          thì mọi hàng khác cao theo hàng cao nhất, và mắt mất khả năng quét dọc — thứ duy nhất khiến
          bảng hơn một danh sách. Cũng vì thế tài liệu này KHÔNG dùng{" "}
          <code className="rounded bg-stroke-soft px-1 py-0.5">hideBelow</code>: ẩn cột là giấu dữ liệu,
          còn kéo ngang thì người dùng vẫn thấy đủ.
        </p>
      </div>

      <Tier
        n={1}
        title="Bảng cơ bản"
        desc="Thứ mọi bảng đều phải có. Bấm tiêu đề để sắp xếp, rê chuột lên dòng để thấy hover, tick ô vuông để chọn nhiều dòng, và thanh phân trang ở chân."
      >
        <BasicTable />
        <div className="mt-3">
          <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Hai trạng thái còn lại</p>
          <StatesRow />
        </div>
      </Tier>

      <Tier
        n={2}
        title={`Ô chuyên dụng — ${CELL_DOCS.length} mẫu`}
        desc="Mỗi ô một demo chạy thật, đứng cạnh luật của chính nó và dòng code chép được. Dựng cột nào thì lấy ô đó, đừng viết lại bằng span + className."
      >
        <div className="flex flex-col gap-3">
          {CELL_DOCS.map((c) => {
            const Demo = tableCellDemos[c.name];
            return (
              <CellDoc key={c.name} name={c.name} when={c.when} rule={c.rule} code={c.code}>
                {Demo ? <Demo /> : null}
              </CellDoc>
            );
          })}
        </div>
      </Tier>

      <Tier
        n={3}
        title="Bảng nâng cao"
        desc="Ghép hết lại: thanh công cụ, mười cột, nhóm cha–con, phân trang. Đây đúng là bảng đang chạy ở Trang chủ — không phải một ví dụ dựng riêng cho tài liệu."
      >
        <AdvancedTable />
      </Tier>
    </section>
  );
}
