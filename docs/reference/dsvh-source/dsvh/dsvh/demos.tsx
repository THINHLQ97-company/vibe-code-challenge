"use client";

/**
 * Registry demo cho trang `/dsvh`.
 *
 * Khoá theo ĐÚNG `name` trong `manifest.ts`. Trang gallery tra theo tên, component nào chưa có
 * demo thì vẫn hiện đầy đủ mô tả/props, kèm nhãn "chưa có demo" — nên thiếu demo không bao giờ
 * làm hỏng trang, và độ phủ demo tự lộ ra để bổ sung dần.
 *
 * Thêm component mới: khai vào `manifest.ts` (bắt buộc, `ds:check` gate) rồi thêm demo ở đây
 * (khuyến khích). Demo nên trưng các BIẾN THỂ dễ dùng sai, không chỉ trạng thái mặc định.
 */

import { useState } from "react";
import type { ReactNode } from "react";

import { GitHubIcon, GoogleIcon } from "./brand-icons";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CalendarIcon,
  ClockCounterClockwiseIcon,
  CardsIcon,
  DatabaseIcon,
  GlobeIcon,
  HouseIcon,
  ShieldIcon,
  DotsThreeIcon,
  GearIcon,
  NotepadIcon,
  PlusIcon,
  RefreshIcon,
  RocketIcon,
  StackIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  CpuIcon,
  MemoryIcon,
  HardDriveIcon
} from "./icons";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Card, CardHeader, KebabButton, LegendDot, PeriodPill } from "./ui/Card";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis } from "recharts";

import { C, axisTick, chartFrame, chartTooltip, cursorLine, gridProps } from "./charts/kit";
import { CountUp } from "./motion/CountUp";
import { Reveal } from "./motion/Reveal";
import { Input } from "./ui/Input";
import { Progress } from "./ui/Progress";
import { SegmentedControl } from "./ui/SegmentedControl";
import { Accordion } from "./ui/data/Accordion";
import { Avatar } from "./ui/data/Avatar";
import { Select } from "./ui/form/Select";
import { Slider } from "./ui/form/Slider";
import { Switch } from "./ui/form/Switch";
import { Textarea } from "./ui/form/Textarea";
import { Table } from "./ui/Table";
import { AuthCard } from "./ui/auth/AuthCard";
import { PasswordInput } from "./ui/auth/PasswordInput";
import { SocialButton } from "./ui/auth/SocialButton";
import { SubdomainInput } from "./ui/deploy/SubdomainInput";
import { FileUpload } from "./ui/FileUpload";
import { Empty } from "./ui/data/Empty";
import { tableCellDemos } from "./table-anatomy";
import { LogViewer } from "./ui/data/LogViewer";
import { MetricGauge } from "./ui/data/MetricGauge";
import { TreeRow } from "./ui/data/TreeGuide";
import { ResourceMeter } from "./ui/data/ResourceMeter";
import { TableToolbar } from "./ui/data/TableToolbar";
import { AppCard } from "./ui/deploy/AppCard";
import { CredentialCard } from "./ui/deploy/CredentialCard";
import { DBTypeCard } from "./ui/deploy/DBTypeCard";
import { DNSRecordTable } from "./ui/deploy/DNSRecordTable";
import { DangerZone } from "./ui/deploy/DangerZone";
import { DeploymentTimeline } from "./ui/deploy/DeploymentTimeline";
import { BranchPicker, RepoPicker } from "./ui/deploy/RepoPicker";
import { SourcePicker } from "./ui/deploy/SourcePicker";
import { TemplateGallery } from "./ui/deploy/TemplateGallery";
import { Kbd } from "./ui/data/Kbd";
import { List, ListItem } from "./ui/data/List";
import { Separator } from "./ui/data/Separator";
import { StatusDot } from "./ui/data/StatusDot";
import { Tag } from "./ui/data/Tag";
import { PinInput } from "./ui/auth/PinInput";
import { Checkbox } from "./ui/form/Checkbox";
import { Combobox } from "./ui/form/Combobox";
import { FormField } from "./ui/form/FormField";
import { KeyValueEditor, type KVPair } from "./ui/form/KeyValueEditor";
import { RadioGroup } from "./ui/form/RadioGroup";
import { SecretInput } from "./ui/form/SecretInput";
import { Breadcrumb } from "./ui/nav/Breadcrumb";
import { Pagination } from "./ui/nav/Pagination";
import { CopyButton } from "./ui/CopyButton";
import { StatTile } from "./ui/StatTile";
import { InfoTile } from "./ui/data/InfoTile";
import { InfoRow } from "@/components/dsvh/ui/data/InfoRow";
import { StatCard } from "./ui/data/StatCard";
import { PageHeader } from "./ui/layout/PageHeader";
import { Stepper } from "./ui/Stepper";
import { Tooltip } from "./ui/Tooltip";
import { Alert } from "./ui/overlay/Alert";
import { Command } from "./ui/overlay/Command";
import { ConfirmDialog } from "./ui/overlay/ConfirmDialog";
import { Drawer } from "./ui/overlay/Drawer";
import { DropdownMenu } from "./ui/overlay/DropdownMenu";
import { Popover } from "./ui/overlay/Popover";
import { ToastProvider, useToast } from "./ui/overlay/Toast";
import { UploadModal } from "./ui/overlay/UploadModal";
import { Modal } from "./ui/overlay/Modal";
import { Skeleton } from "./ui/nav/Skeleton";
import { Spinner } from "./ui/nav/Spinner";
import { Tabs, TabsNav } from "./ui/nav/Tabs";
import { PageShell } from "./ui/layout/PageShell";

/** Hàng demo có chú thích ngắn bên phải — để người xem biết đang nhìn biến thể nào. */
function Row({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {children}
      {note ? <span className="text-caption text-ink-3">{note}</span> : null}
    </div>
  );
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function ButtonDemo() {
  return (
    <Stack>
      <Row note="variant">
        <Button variant="solid">Solid</Button>
        <Button variant="dark">Dark</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="soft">Soft</Button>
        <Button variant="cream">Cream</Button>
        <Button variant="link" rightIcon={<ArrowRightIcon size={15} />}>Link</Button>
        <Button variant="quiet">Quiet</Button>
      </Row>
      <Row note="size + trạng thái">
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button size="lg">lg</Button>
        <Button loading>loading</Button>
        <Button disabled>disabled</Button>
      </Row>
      <Row note="CTA có icon + text — icon tự cách bằng gap, KHÔNG tự chèn margin">
        <Button leftIcon={<RocketIcon size={16} />}>Triển khai ngay</Button>
        <Button variant="ghost" rightIcon={<ArrowRightIcon size={16} />}>
          Xem chi tiết
        </Button>
        <Button variant="cream" leftIcon={<PlusIcon size={16} />}>
          Tạo mới
        </Button>
      </Row>
      <Row note="chỉ-icon — BẮT BUỘC aria-label + bọc Tooltip">
        <Tooltip content="Cấu hình">
          <Button size="icon" variant="ghost" aria-label="Cấu hình">
            <GearIcon size={18} />
          </Button>
        </Tooltip>
        <Tooltip content="Làm mới">
          <Button size="icon" variant="ghost" aria-label="Làm mới">
            <RefreshIcon size={18} />
          </Button>
        </Tooltip>
      </Row>
    </Stack>
  );
}

function BadgeDemo() {
  return (
    <Row note="tone — lấy từ status.ts, đừng tự chế màu">
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="outline">Outline</Badge>
    </Row>
  );
}

function SwitchDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);
  return (
    <Stack>
      <Row note="mặc định — nhãn NGOÀI track">
        <Switch checked={a} onChange={setA} label="Public workspace" />
      </Row>
      <Row note="onLabel/offLabel — chữ NẰM TRONG track, cho cột trạng thái bảng chật ngang">
        <Switch checked={a} onChange={setA} onLabel="Bật" offLabel="Tắt" />
        <Switch checked={b} onChange={setB} onLabel="Bật" offLabel="Tắt" />
      </Row>
      <Row note="sm / lg">
        <Switch checked={a} onChange={setA} onLabel="Bật" offLabel="Tắt" size="sm" />
        <Switch checked={a} onChange={setA} onLabel="Bật" offLabel="Tắt" size="lg" />
      </Row>
      <Row note='nhãn dài hơn 1 từ → nới bằng className="w-24"'>
        <Switch checked={c} onChange={setC} onLabel="Đang bật" offLabel="Tạm tắt" className="w-24" />
      </Row>
    </Stack>
  );
}

function InputDemo() {
  const [v, setV] = useState("");
  return (
    <Stack>
      <Row>
        <div className="w-64">
          <Input label="Tên miền" placeholder="vd: my-app" value={v} onChange={(e) => setV(e.target.value)} hint="Chỉ chữ thường, số và dấu gạch ngang." />
        </div>
      </Row>
      <Row note="trạng thái lỗi">
        <div className="w-64">
          <Input label="Email" defaultValue="sai-dinh-dang" error="Email không hợp lệ." />
        </div>
      </Row>
    </Stack>
  );
}

function TextareaDemo() {
  return (
    <div className="w-80">
      <Textarea label="Ghi chú" placeholder="Nhập mô tả triển khai…" hint="autoGrow bật khi dùng cho chat/comment." />
    </div>
  );
}

function SelectDemo() {
  const [v, setV] = useState("postgres");
  return (
    <div className="w-64">
      <Select
        label="Loại cơ sở dữ liệu"
        value={v}
        onChange={setV}
        options={[
          { value: "postgres", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL" },
          { value: "redis", label: "Redis" },
          { value: "mongo", label: "MongoDB", disabled: true },
        ]}
      />
    </div>
  );
}

function CardDemo() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader title="Tài nguyên" />
        <p className="text-body text-ink-2">Nội dung panel nằm trong Card. Hover có hiệu ứng nâng nhẹ.</p>
      </Card>
    </div>
  );
}

function ProgressDemo() {
  return (
    <Stack>
      <Row note="md + showValue">
        <div className="w-64"><Progress value={68} showValue /></div>
      </Row>
      <Row note="sm">
        <div className="w-64"><Progress value={32} size="sm" /></div>
      </Row>
      {/* Ba bậc trạng thái của luật #7 xếp cạnh nhau — chỉ nhìn rời từng cái thì không thấy `amber`
          có thật sự đứng được ở giữa teal và đỏ hay không. */}
      <Row note="teal · amber · red (luật #7)">
        <div className="flex w-64 flex-col gap-2">
          <Progress value={42} tone="teal" size="sm" />
          <Progress value={78} tone="amber" size="sm" />
          <Progress value={95} tone="red" size="sm" />
        </div>
      </Row>
    </Stack>
  );
}

function SpinnerDemo() {
  return (
    <Row note="sm / md / lg">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Row>
  );
}

function SkeletonDemo() {
  return (
    <Stack>
      <Row note="variant">
        <Skeleton variant="circle" className="size-10" />
        <Skeleton variant="text" className="h-4 w-40" />
        <Skeleton variant="rect" className="h-10 w-28" />
      </Row>
    </Stack>
  );
}

function AvatarDemo() {
  return (
    <Row note="fallback chữ cái khi không có src">
      <Avatar name="Trần Anh Tú" size="sm" />
      <Avatar name="Nguyễn Quang Thọ" size="md" />
      <Avatar name="Mắt Bão" size="lg" shape="square" />
    </Row>
  );
}

/**
 * `label` là ReactNode nên ICON ĐẶT TRƯỚC TEXT là cách dùng chuẩn — bọc
 * `<span className="inline-flex items-center gap-1.5">`. Quy ước này đang chạy thật ở
 * `/admin/deployments` và `/admin/plans` nhưng trước nay mỗi nơi tự gõ lại; đưa vào đây để nó là
 * quy ước của hệ, không phải mẹo truyền miệng.
 */
const tabLabel = (Icon: typeof RocketIcon, text: string) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon size={15} />
    {text}
  </span>
);

function TabsDemo() {
  return (
    <Stack>
      <div className="w-full max-w-lg">
        <Tabs
          tabs={[
            { id: "overview", label: tabLabel(CardsIcon, "Tổng quan"), content: <p className="pt-3 text-body text-ink-2">Icon đặt TRƯỚC text — cách dùng chuẩn.</p> },
            { id: "logs", label: tabLabel(NotepadIcon, "Nhật ký"), content: <p className="pt-3 text-body text-ink-2">Nội dung tab Nhật ký.</p> },
            { id: "settings", label: tabLabel(GearIcon, "Cấu hình"), content: <p className="pt-3 text-body text-ink-2">Nội dung tab Cấu hình.</p>, disabled: true },
          ]}
        />
      </div>
      <div className="w-full max-w-lg">
        <p className="mb-2 text-caption text-ink-3">Không icon (chỉ khi nhãn đã đủ rõ):</p>
        <Tabs
          tabs={[
            { id: "a", label: "Tất cả", content: <p className="pt-3 text-body text-ink-2">…</p> },
            { id: "b", label: "Đang chạy", content: <p className="pt-3 text-body text-ink-2">…</p> },
          ]}
        />
      </div>
    </Stack>
  );
}

function TabsNavDemo() {
  return (
    <Stack>
      <div className="w-full max-w-lg">
        <p className="mb-2 text-caption text-ink-3">
          Mỗi tab một URL — trạng thái chọn đọc từ <code>usePathname()</code>. Ở trang tài liệu này
          không tab nào khớp đường dẫn hiện tại nên cả ba đều ở trạng thái nghỉ; xem bản chạy thật ở{" "}
          <a href="/profile" className="text-link underline">/profile</a>.
        </p>
        <TabsNav
          label="Ví dụ điều hướng theo route"
          items={[
            { href: "/profile", exact: true, label: tabLabel(UserIcon, "Hồ sơ") },
            { href: "/profile/security", label: tabLabel(ShieldIcon, "Bảo mật") },
            { href: "/profile/account", label: tabLabel(GearIcon, "Tài khoản") },
          ]}
        />
      </div>
    </Stack>
  );
}

function PageShellDemo() {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-stroke bg-surface-2">
      <PageShell title="Tiêu đề trang" subtitle="Một dòng mô tả ngắn" action={<Button size="sm">Tạo mới</Button>}>
        <Card>
          <p className="text-body text-ink-2">Nội dung trang nằm ở đây. Khung lo đệm ngoài + nhịp dọc.</p>
        </Card>
        <Card>
          <p className="text-body text-ink-2">Khối thứ hai — khoảng cách 24px do khung quyết định.</p>
        </Card>
      </PageShell>
    </div>
  );
}

function AccordionDemo() {
  return (
    <div className="w-full max-w-lg">
      <Accordion
        items={[
          { id: "a", title: "Triển khai mất bao lâu?", content: "Thường 30–90 giây tuỳ kích thước image." },
          { id: "b", title: "Có rollback được không?", content: "Có — rollback về bản build trước dưới 1 phút." },
        ]}
      />
    </div>
  );
}

function SegmentedControlDemo() {
  const [v, setV] = useState<"day" | "week" | "month">("week");
  return (
    <SegmentedControl
      value={v}
      onChange={setV}
      options={[
        { value: "day", label: "Ngày" },
        { value: "week", label: "Tuần" },
        { value: "month", label: "Tháng" },
      ]}
    />
  );
}

function SliderDemo() {
  const [v, setV] = useState(40);
  return (
    <div className="w-64 space-y-4">
      <div>
        <Slider value={v} onChange={setV} min={0} max={100} step={5} aria-label="Giá trị demo" />
        <p className="mt-2 text-caption text-ink-3">Giá trị: {v}</p>
      </div>
      <div>
        <Slider value={30} onChange={() => {}} min={0} max={100} step={5} disabled aria-label="Ví dụ vô hiệu hoá" />
        <p className="mt-2 text-caption text-ink-3">Vô hiệu hoá — phần tô về xám, không kéo được</p>
      </div>
    </div>
  );
}

function PaginationDemo() {
  const [p, setP] = useState(3);
  return <Pagination page={p} totalPages={12} onPageChange={setP} />;
}


type Row = { id: string; name: string; plan: string; ram: string };
const ROWS: Row[] = [
  { id: "1", name: "matbao-blog", plan: "Pro", ram: "512MB" },
  { id: "2", name: "api-gateway", plan: "Free", ram: "256MB" },
  { id: "3", name: "docs-site", plan: "Pro", ram: "128MB" },
];

function TableDemo() {
  return (
    <Table<Row>
      data={ROWS}
      getRowId={(r) => r.id}
      columns={[
        { key: "name", header: "Dự án", accessorKey: "name", sortable: true },
        { key: "plan", header: "Gói", render: (r) => <Badge tone={r.plan === "Pro" ? "accent" : "neutral"} size="sm">{r.plan}</Badge> },
        { key: "ram", header: "RAM", accessorKey: "ram", align: "right" },
      ]}
    />
  );
}

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Mở Modal</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Xoá dự án?"
        description="Hành động này không hoàn tác được. Toàn bộ container và dữ liệu sẽ bị xoá."
        tone="error"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={() => setOpen(false)}>Xoá</Button>
          </>
        }
      />
    </>
  );
}

function ComboboxDemo() {
  const [v, setV] = useState("hcm");
  return (
    <div className="w-64">
      <Combobox
        value={v}
        onChange={setV}
        placeholder="Gõ để lọc khu vực…"
        options={[
          { value: "hcm", label: "TP. Hồ Chí Minh" },
          { value: "hn", label: "Hà Nội" },
          { value: "dn", label: "Đà Nẵng" },
          { value: "sg", label: "Singapore" },
        ]}
      />
    </div>
  );
}

function DropdownMenuDemo() {
  // Mục CHỌN-MỘT giữ state để bấm thử thấy dấu chọn nhảy — demo tĩnh không cho thấy điều đáng xem
  // nhất của `selected`: nhãn KHÔNG dịch ngang khi dấu chọn đổi chỗ.
  const [sort, setSort] = useState("moi");
  return (
    <Stack>
      <DropdownMenu
        trigger={<Button variant="ghost" size="icon" aria-label="Hành động"><DotsThreeIcon size={18} /></Button>}
        items={[
          { label: "Xem chi tiết", onSelect: () => {} },
          { label: "Nhân bản", onSelect: () => {} },
          { separator: true },
          { label: "Xoá", icon: <TrashIcon size={15} />, danger: true, onSelect: () => {} },
        ]}
      />
      {/* Nhóm chọn-một: `selected` biến mục thành `menuitemradio` + `aria-checked`. */}
      <DropdownMenu
        trigger={<Button variant="ghost" size="sm">Sắp xếp</Button>}
        items={[
          { label: "Mới nhất", selected: sort === "moi", onSelect: () => setSort("moi") },
          { label: "Cũ nhất", selected: sort === "cu", onSelect: () => setSort("cu") },
          { label: "Tên A→Z", selected: sort === "az", onSelect: () => setSort("az") },
        ]}
      />
    </Stack>
  );
}

function SocialButtonDemo() {
  return (
    <Stack>
      <div className="w-72 flex flex-col gap-2">
        <SocialButton icon={<GoogleIcon />}>Tiếp tục với Google</SocialButton>
        <SocialButton icon={<GitHubIcon />}>Tiếp tục với GitHub</SocialButton>
      </div>
    </Stack>
  );
}

function PasswordInputDemo() {
  const [v, setV] = useState("Matbao@2026");
  return (
    <div className="w-72">
      <PasswordInput label="Mật khẩu mới" value={v} onChange={(e) => setV(e.target.value)} showStrength />
    </div>
  );
}

function AuthCardDemo() {
  return (
    <div className="w-full max-w-sm">
      <AuthCard title="Đăng nhập" subtitle="Dùng tài khoản Mắt Bão của bạn">
        <div className="flex flex-col gap-3">
          <Input label="Email" placeholder="you@matbao.com" />
          <PasswordInput label="Mật khẩu" />
          <Button className="w-full">Đăng nhập</Button>
        </div>
      </AuthCard>
    </div>
  );
}

function SubdomainInputDemo() {
  const [a, setA] = useState("my-app");
  const [b, setB] = useState("da-ton-tai");
  return (
    <Stack>
      <div className="w-80">
        <SubdomainInput label="Tên miền phụ" value={a} onChange={setA} status="available" message="Tên miền còn trống." />
      </div>
      <div className="w-80">
        <SubdomainInput value={b} onChange={setB} status="taken" message="Tên miền đã có người dùng." />
      </div>
    </Stack>
  );
}


function CheckboxDemo() {
  const [a, setA] = useState(true);
  return (
    <Stack>
      <Row note="trạng thái">
        <Checkbox checked={a} onChange={setA} label="Bật sao lưu tự động" />
      </Row>
      <Row>
        <Checkbox checked={false} onChange={() => {}} indeterminate label="Chọn một phần" />
        <Checkbox checked={false} onChange={() => {}} disabled label="Đã khoá" />
      </Row>
    </Stack>
  );
}

function RadioGroupDemo() {
  const [v, setV] = useState("monthly");
  return (
    <RadioGroup
      name="chu-ky"
      value={v}
      onChange={setV}
      options={[
        { value: "monthly", label: "Hằng tháng" },
        { value: "yearly", label: "Hằng năm (giảm 20%)" },
        { value: "trial", label: "Dùng thử", disabled: true },
      ]}
    />
  );
}

function FormFieldDemo() {
  return (
    <div className="w-72">
      <FormField label="Tên dự án" hint="Dùng cho tên miền phụ mặc định." required htmlFor="demo-ff">
        <Input id="demo-ff" placeholder="vd: my-app" />
      </FormField>
    </div>
  );
}

function SecretInputDemo() {
  return (
    <div className="w-80">
      <SecretInput label="API key" defaultValue="vays_sk_9f2c8a1d4b7e" hint="Chỉ hiện đúng một lần lúc tạo." />
    </div>
  );
}

function KeyValueEditorDemo() {
  const [rows, setRows] = useState<KVPair[]>([
    { key: "DATABASE_URL", value: "postgres://…" },
    { key: "NODE_ENV", value: "production" },
  ]);
  return (
    <div className="w-full max-w-lg">
      <KeyValueEditor label="Biến môi trường" value={rows} onChange={setRows} />
    </div>
  );
}

function PinInputDemo() {
  const [v, setV] = useState("");
  return (
    <Stack>
      <PinInput value={v} onChange={setV} length={6} />
      <span className="text-caption text-ink-3">Đã nhập: {v || "—"}</span>
    </Stack>
  );
}

function BreadcrumbDemo() {
  return (
    <Breadcrumb
      items={[
        { label: "Dự án", href: "#" },
        { label: "matbao-blog", href: "#" },
        { label: "Tên miền" },
      ]}
    />
  );
}

function TagDemo() {
  return (
    <Row note="có nút ✕ — khác Badge (Badge không xoá được)">
      <Tag onRemove={() => {}}>Đang chạy</Tag>
      <Tag tone="accent" onRemove={() => {}}>Pro</Tag>
      <Tag tone="success">Đã xác minh</Tag>
      <Tag tone="danger" onRemove={() => {}}>Lỗi</Tag>
    </Row>
  );
}

function KbdDemo() {
  return (
    <Row note="phím tắt">
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
      <Kbd>Esc</Kbd>
    </Row>
  );
}

function EmptyDemo() {
  /* Trưng CẢ HAI variant cạnh nhau, vì việc chọn variant mới là chỗ hay sai — nhìn riêng một cái
     thì không thấy được vì sao lại có hai. Bên trái mô phỏng đúng ngữ cảnh thật của `inline`:
     nằm TRONG một khối đã có khung. */
  return (
    <div className="grid w-full gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-1.5 text-caption text-ink-3">
          <code className="rounded bg-stroke-soft px-1 py-0.5">inline</code> — trong một khối đã có khung
        </p>
        <div className="rounded-card border border-stroke bg-surface p-4">
          <p className="mb-2 text-body font-semibold text-ink">Sự kiện gần đây</p>
          <Empty
            icon={<GlobeIcon size={40} />}
            title="Chưa có sự kiện nào"
            description="Sự kiện sẽ hiện ở đây sau lần triển khai đầu tiên."
          />
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-caption text-ink-3">
          <code className="rounded bg-stroke-soft px-1 py-0.5">block</code> — đứng một mình giữa trang
        </p>
        <Empty
          variant="block"
          icon={<GlobeIcon size={40} />}
          title="Chưa có dự án nào"
          description="Tạo dự án đầu tiên để bắt đầu triển khai."
          action={<Button>Tạo dự án</Button>}
        />
      </div>
    </div>
  );
}

function ListDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      {/* Bản `block` — đứng một mình, tự mang khung. */}
      <List>
        <ListItem
          leading={<Avatar name="Trần Anh Tú" size="sm" />}
          title="Trần Anh Tú"
          description="tuta@matbao.com"
          trailing={<Badge tone="accent" size="sm">Admin</Badge>}
        />
        <ListItem
          leading={<Avatar name="Nguyễn Quang Thọ" size="sm" />}
          title="Nguyễn Quang Thọ"
          description="thonq@matbao.com"
          trailing={<Badge tone="neutral" size="sm">Dev</Badge>}
        />
      </List>
      {/* Bản `inline` — đã nằm trong khối có khung nên KHÔNG mang khung thứ hai. Đặt trong
          `Card` để thấy đúng thứ nó phải trông như thế: chỉ còn vạch ngăn, chữ thẳng hàng
          với tiêu đề thẻ chứ không thụt vào. */}
      <Card>
        <CardHeader title="Website sử dụng" />
        <List variant="inline">
          <ListItem
            title="abc.hoadon.online"
            trailing={<Badge tone="neutral" size="sm">Bạn tự chọn</Badge>}
          />
          <ListItem
            title="shop.hoadon.online"
            trailing={<Badge tone="success" size="sm">Đã đối chiếu</Badge>}
          />
        </List>
      </Card>
    </div>
  );
}

function StatusDotDemo() {
  return (
    <Stack>
      <Row note="có pulse khi đang chạy dở">
        <StatusDot status="building" showLabel />
        <StatusDot status="live" showLabel />
        <StatusDot status="failed" showLabel />
      </Row>
      <Row note="trạng thái tĩnh">
        <StatusDot status="queued" showLabel />
        <StatusDot status="stopped" showLabel />
        <StatusDot status="degraded" showLabel />
      </Row>
    </Stack>
  );
}

function SeparatorDemo() {
  return (
    <Stack>
      <div className="w-64">
        <p className="text-caption text-ink-2">Trên</p>
        <Separator />
        <p className="text-caption text-ink-2">Dưới</p>
      </div>
      <Row note="dọc">
        <div className="flex h-8 items-center gap-3">
          <span className="text-caption text-ink-2">Trái</span>
          <Separator orientation="vertical" />
          <span className="text-caption text-ink-2">Phải</span>
        </div>
      </Row>
    </Stack>
  );
}


function AlertDemo() {
  return (
    <Stack>
      <Alert tone="info" title="Đang chạy bản thử">Một số tính năng còn mô phỏng.</Alert>
      <Alert tone="success" title="Triển khai xong">Ứng dụng đã chạy tại my-app.b.matbao.ai.</Alert>
      <Alert tone="warning" title="Sắp hết dung lượng">Còn 12% ổ đĩa.</Alert>
      <Alert tone="error" variant="loud" title="Build thất bại" onClose={() => {}}>
        Xem nhật ký để biết chi tiết.
      </Alert>
    </Stack>
  );
}

function ToastInner() {
  const { toast } = useToast();
  return (
    <Row note="thông báo nổi, tự biến mất">
      <Button variant="ghost" onClick={() => toast({ tone: "success", title: "Đã lưu thay đổi" })}>Thành công</Button>
      <Button variant="ghost" onClick={() => toast({ tone: "error", title: "Không kết nối được node" })}>Lỗi</Button>
    </Row>
  );
}
function ToastDemo() {
  return (
    <ToastProvider>
      <ToastInner />
    </ToastProvider>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Mở Drawer</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Chi tiết triển khai">
        <p className="text-body text-ink-2">Panel trượt từ cạnh — dùng cho form dài hoặc chi tiết.</p>
      </Drawer>
    </>
  );
}

function PopoverDemo() {
  return (
    <Popover trigger={<Button variant="ghost">Mở Popover</Button>}>
      <div className="w-56 p-1">
        <p className="text-caption text-ink-2">Menu ngữ cảnh neo theo nút, tự né mép màn hình.</p>
      </div>
    </Popover>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Row note="⌘K tìm nhanh">
        <Button variant="ghost" onClick={() => setOpen(true)}>
          Mở Command <Kbd>⌘</Kbd> <Kbd>K</Kbd>
        </Button>
      </Row>
      <Command
        open={open}
        onOpenChange={setOpen}
        placeholder="Tìm lệnh…"
        groups={[
          {
            heading: "Điều hướng",
            items: [
              { id: "dash", label: "Bảng điều khiển", onSelect: () => setOpen(false) },
              { id: "proj", label: "Dự án", onSelect: () => setOpen(false) },
            ],
          },
          {
            heading: "Hành động",
            items: [{ id: "new", label: "Tạo dự án mới", onSelect: () => setOpen(false) }],
          },
        ]}
      />
    </>
  );
}

function ConfirmDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Mở xác nhận</Button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        tone="danger"
        title="Xoá cơ sở dữ liệu?"
        description="Toàn bộ dữ liệu sẽ mất và không khôi phục được."
        confirmLabel="Xoá"
      />
    </>
  );
}

function UploadModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Mở Upload</Button>
      <UploadModal open={open} onClose={() => setOpen(false)} maxFiles={3} accept=".zip,.html" />
    </>
  );
}

function TooltipDemo() {
  return (
    <Row note="bắt buộc đi kèm nút chỉ-icon (a11y)">
      <Tooltip content="Xoá dự án">
        <Button variant="ghost" size="icon" aria-label="Xoá"><TrashIcon size={18} /></Button>
      </Tooltip>
      <Tooltip content="Mở menu" side="bottom">
        <Button variant="ghost" size="icon" aria-label="Menu"><DotsThreeIcon size={18} /></Button>
      </Tooltip>
    </Row>
  );
}

function CopyButtonDemo() {
  return (
    <Row note="icon-only và bản có chữ">
      <CopyButton value="https://my-app.b.matbao.ai" />
      <CopyButton value="postgres://user:pass@host:5432/db" label="Sao chép chuỗi kết nối" />
    </Row>
  );
}

function StepperDemo() {
  const [cur, setCur] = useState(1);
  return (
    <Stack>
      <Stepper
        current={cur}
        steps={[
          { label: "Chọn nguồn", description: "GitHub / ZIP" },
          { label: "Cấu hình", description: "Env + tài nguyên" },
          { label: "Triển khai" },
        ]}
      />
      <Row>
        <Button size="sm" variant="ghost" onClick={() => setCur((c) => Math.max(0, c - 1))}>Lùi</Button>
        <Button size="sm" variant="ghost" onClick={() => setCur((c) => Math.min(2, c + 1))}>Tiếp</Button>
      </Row>
    </Stack>
  );
}

function StatTileDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <StatTile label="Lượt truy cập" value="24.8K" delta="+12,4%" positive />
      <StatTile label="Lỗi 5xx" value="37" delta="-3,1%" positive={false} />
    </div>
  );
}


function LogViewerDemo() {
  return (
    <LogViewer
      title="build.log"
      streaming
      lines={[
        { ts: "10:22:01", level: "info", text: "Đang kéo image node:22-alpine…" },
        { ts: "10:22:09", level: "success", text: "Cài đặt phụ thuộc xong (412 gói)" },
        { ts: "10:22:31", level: "warn", text: "2 gói đã lỗi thời" },
        { ts: "10:22:47", level: "error", text: "Type error tại src/app/page.tsx:14" },
      ]}
    />
  );
}

function MetricGaugeDemo() {
  return (
    /* Bỏ chú thích "ngưỡng cảnh báo" (07/08): cung ĐÃ tự đổi màu theo ngưỡng, thêm một dòng chữ nói
       lại điều mắt vừa thấy là thừa. Cỡ thứ hai để 104px — đúng cỡ dashboard đang dùng, để tài liệu
       cho thấy component chạy được ở cả hai cỡ chứ không chỉ ở cỡ mặc định. */
    <Row>
      <MetricGauge value={38} max={100} label="CPU" unit="%" />
      <MetricGauge value={87} max={100} label="RAM" unit="%" thresholds={{ warning: 70, danger: 85 }} />
      <MetricGauge value={62} max={100} size={104} label="Dung lượng" unit="%" sublabel="6.2/10 GB" />
    </Row>
  );
}

function TreeGuideDemo() {
  /* Demo dựng bằng CHÍNH `Table` + `rowGroup` — không phải bản mô phỏng bằng div. Nhờ vậy cái nhìn
     thấy ở đây đúng là cái chạy ở /dashboard: cùng đệm ô, cùng đường kẻ giữa hàng, cùng phép gom
     cụm. Bản mô phỏng riêng sẽ đẹp hơn thực tế rồi giấu mất mấy chỗ chỉ hỏng khi ghép vào bảng. */
  type Site = { id: string; name: string; url: string; order?: string; stackId?: string; stackName?: string };
  const rows: Site[] = [
    { id: "1", name: "app-xa0hpo-backend", url: "app-xa0hpo-backend.b.matbao.ai", order: "1/2", stackId: "s1", stackName: "app-xa0hpo" },
    { id: "2", name: "app-xa0hpo", url: "app-xa0hpo.b.matbao.ai", order: "2/2", stackId: "s1", stackName: "app-xa0hpo" },
    { id: "3", name: "test-file", url: "test-file-html.b.matbao.ai" },
  ];
  return (
    <div className="w-full max-w-3xl">
      <Table
        data={rows}
        getRowId={(r) => r.id}
        columns={[
          {
            key: "name",
            header: "Website",
            render: (r, _i, group) => {
              const name = (
                <>
                  <span className="truncate text-body font-medium text-ink">{r.name}</span>
                  {r.order && (
                    <span className="shrink-0 rounded-sm bg-stroke-soft px-1.5 py-0.5 text-meta tabular-nums text-ink-2">
                      {r.order}
                    </span>
                  )}
                </>
              );
              if (!group) return <span className="flex items-center gap-2">{name}</span>;
              return <TreeRow last={group.last} className="-my-3">{name}</TreeRow>;
            },
          },
          { key: "url", header: "Địa chỉ", render: (r) => <span className="text-body text-link">{r.url}</span> },
        ]}
        rowGroup={{
          keyOf: (r) => r.stackId ?? null,
          header: (_k, group) => (
            <span className="flex flex-wrap items-center gap-2">
              <StackIcon size={16} className="shrink-0 text-ink-2" />
              <span className="text-body font-medium text-ink">{group[0]?.stackName}</span>
              <span className="text-body text-ink-2">đang chạy {group.length}/{group.length} thành phần</span>
            </span>
          ),
        }}
      />
    </div>
  );
}

function ResourceMeterDemo() {
  return (
    <div className="w-full max-w-md flex flex-col gap-3">
      <ResourceMeter label="Dung lượng ổ" used={6.4} total={10} unit="GB" />
      <ResourceMeter label="Băng thông" used={182} total={200} unit="GB" />
    </div>
  );
}

function TableToolbarDemo() {
  const [q, setQ] = useState("");
  return (
    <div className="w-full">
      <TableToolbar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Tìm dự án…"
        selectedCount={2}
        onClearSelection={() => {}}
        bulkActions={<Button size="sm" variant="ghost">Xoá đã chọn</Button>}
      />
    </div>
  );
}

function DBTypeCardDemo() {
  const [v, setV] = useState<"postgres" | "mysql" | "redis" | "mongo">("postgres");
  return (
    <DBTypeCard
      value={v}
      onChange={setV}
      columns={4}
      options={[
        { engine: "postgres", name: "PostgreSQL", version: "16" },
        { engine: "mysql", name: "MySQL", version: "8" },
        { engine: "redis", name: "Redis", version: "7" },
        { engine: "mongo", name: "MongoDB", version: "7" },
      ]}
    />
  );
}

function CredentialCardDemo() {
  return (
    <div className="w-full max-w-lg">
      <CredentialCard
        title="Thông tin kết nối"
        connectionString="postgres://vays:••••@db-01.b.matbao.ai:5432/app"
        fields={[
          { label: "Host", value: "db-01.b.matbao.ai" },
          { label: "Người dùng", value: "vays" },
          { label: "Mật khẩu", value: "s3cr3t-p4ss", secret: true },
        ]}
      />
    </div>
  );
}

function AppCardDemo() {
  return (
    <div className="w-72">
      <AppCard
        name="Gitea"
        category="Lập trình"
        description="Git server nhẹ, nhanh, dễ dùng"
        metrics={{ core: "0.5", ram: "512MB" }}
        actionLabel="Triển khai"
        onDeploy={() => {}}
      />
    </div>
  );
}

function TemplateGalleryDemo() {
  return (
    <TemplateGallery
      columns={3}
      onDeploy={() => {}}
      items={[
        { id: "1", name: "Ghost", category: "Blog", description: "Nền tảng xuất bản", metrics: { core: "0.3", ram: "256MB" } },
        { id: "2", name: "n8n", category: "Tự động hoá", description: "Workflow tự động", metrics: { core: "0.5", ram: "512MB" } },
        { id: "3", name: "Uptime Kuma", category: "Giám sát", description: "Theo dõi uptime", metrics: { core: "0.2", ram: "128MB" } },
      ]}
    />
  );
}

function DNSRecordTableDemo() {
  return (
    <DNSRecordTable
      records={[
        { type: "A", name: "@", value: "103.28.36.12", ttl: "Auto", status: "verified" },
        { type: "CNAME", name: "www", value: "my-app.b.matbao.ai", ttl: 3600, status: "pending" },
        { type: "TXT", name: "_acme-challenge", value: "kJ2n…9fA", ttl: "Auto", status: "error" },
      ]}
    />
  );
}

function DangerZoneDemo() {
  return (
    <div className="w-full max-w-lg">
      <DangerZone
        actions={[
          {
            title: "Xoá dự án",
            description: "Xoá vĩnh viễn dự án và toàn bộ dữ liệu.",
            buttonLabel: "Xoá dự án",
            confirmTitle: "Xoá dự án?",
            confirmDescription: "Không hoàn tác được.",
            confirmText: "my-app",
            onConfirm: () => {},
          },
        ]}
      />
    </div>
  );
}

function RepoPickerDemo() {
  const [repo, setRepo] = useState("1");
  const [branch, setBranch] = useState("main");
  return (
    <Stack>
      <div className="w-full max-w-lg">
        <RepoPicker
          value={repo}
          onChange={setRepo}
          searchable
          repos={[
            { id: "1", name: "matbao/vays-panel", provider: "github", private: true, updated: "2 giờ trước" },
            { id: "2", name: "matbao/landing", provider: "gitlab", updated: "hôm qua" },
          ]}
        />
      </div>
      <div className="w-64">
        <BranchPicker value={branch} onChange={setBranch} branches={["main", "dev-test", "fontend"]} />
      </div>
    </Stack>
  );
}

function SourcePickerDemo() {
  const [v, setV] = useState<string | null>("github");
  return (
    <SourcePicker
      value={v}
      onChange={setV}
      columns={3}
      options={[
        { value: "github", label: "GitHub", description: "Kết nối repo", icon: <GitHubIcon /> },
        { value: "zip", label: "Tải ZIP", description: "Tệp nén sẵn", icon: <UploadIcon size={20} /> },
        { value: "template", label: "Mẫu có sẵn", description: "Chọn từ thư viện", icon: <CardsIcon size={20} /> },
      ]}
    />
  );
}

function DeploymentTimelineDemo() {
  return (
    <div className="w-full max-w-lg">
      <DeploymentTimeline
        onRollback={() => {}}
        items={[
          { id: "3", status: "live", title: "Cập nhật trang chủ", commit: "a1b2c3d", time: "10 phút trước", current: true },
          { id: "2", status: "failed", title: "Sửa lỗi build", commit: "9f8e7d6", time: "1 giờ trước" },
          { id: "1", status: "stopped", title: "Khởi tạo dự án", commit: "0011223", time: "hôm qua", canRollback: true },
        ]}
      />
    </div>
  );
}

function FileUploadDemoWrap() {
  return (
    <div className="w-full max-w-lg">
      <FileUpload accept=".zip,.html" multiple maxFiles={3} label="Tệp triển khai" description="Kéo thả .zip hoặc .html vào đây." />
    </div>
  );
}


function ChartKitDemo() {
  return (
    <Stack>
      <Row note="palette C — cùng màu với token, dạng hex để Recharts vẽ được SVG">
        {(["orange", "orangeBright", "teal", "mint", "peach", "magenta"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className="size-5 rounded border border-stroke" style={{ background: C[k] }} />
            <code className="text-meta text-ink-3">C.{k}</code>
          </span>
        ))}
      </Row>
      <Row note="chú thích chart">
        <LegendDot color={C.orange} label="Lượt truy cập" />
        <LegendDot color={C.teal} label="Người dùng mới" />
      </Row>
      <pre className="overflow-x-auto rounded-lg border border-stroke bg-surface-2 p-3">
        <code className="text-caption text-ink-2">{`<CartesianGrid {...gridProps} />
<XAxis tick={axisTick} />
<Tooltip cursor={cursorLine} content={<TooltipCard />} />
<Area stroke={C.orange} fill={C.peach} />`}</code>
      </pre>
    </Stack>
  );
}

function RevealDemo() {
  const [k, setK] = useState(0);
  return (
    <Stack>
      <Button size="sm" variant="ghost" onClick={() => setK((v) => v + 1)}>Chạy lại hiệu ứng</Button>
      <Reveal key={k}>
        <div className="rounded-card border border-stroke bg-surface p-4">
          <p className="text-body text-ink-2">Khối này fade + trượt lên khi vào màn.</p>
        </div>
      </Reveal>
    </Stack>
  );
}

function CountUpDemoLive() {
  const [k, setK] = useState(0);
  return (
    <Stack>
      <Button size="sm" variant="ghost" onClick={() => setK((v) => v + 1)}>Đếm lại</Button>
      <p className="text-hero font-bold text-ink">
        <CountUp key={k} end={24800} />
      </p>
    </Stack>
  );
}

function PeriodPillDemo() {
  return (
    <Row note="thường đặt ở góc phải CardHeader của chart card">
      <PeriodPill />
    </Row>
  );
}

function KebabDemo() {
  return (
    <Row note="hành động phụ ở góc thẻ">
      <KebabButton />
    </Row>
  );
}

function LegendDotDemo() {
  return (
    <Row note="mỗi series một chấm, màu lấy từ palette C">
      <LegendDot color={C.orange} label="Đang chạy" />
      <LegendDot color={C.teal} label="Thành công" />
      <LegendDot color={C.magenta} label="Lỗi" />
    </Row>
  );
}


function PageHeaderDemo() {
  return (
    <Stack>
      <div className="rounded-lg border border-dashed border-stroke p-3">
        <PageHeader title="Trang chủ" subtitle="Tổng quan tài nguyên và danh sách website đang triển khai" />
      </div>
      <div className="rounded-lg border border-dashed border-stroke p-3">
        <PageHeader title="Quản lý gói" subtitle="Danh sách gói dịch vụ" action={<Button size="sm" leftIcon={<PlusIcon size={16} />}>Tạo gói</Button>} />
      </div>
    </Stack>
  );
}

function InfoRowDemo() {
  return (
    <Stack>
      <Row note="`row` (mặc định) — nhãn trái, giá trị phải. Cỡ chữ do component quyết: nhãn `text-caption`, giá trị `text-body`">
        <Card className="w-full max-w-lg">
          <CardHeader title="Danh tính" />
          <dl className="space-y-2.5">
            <InfoRow label="Địa chỉ" value="http://maint-0vxxjk.invalid:8080" />
            <InfoRow label="Miền ứng dụng" value="—" />
            <InfoRow label="UUID" value="00000000-0000-4000-8000-0000000vxxjk" numeric wrap />
            <InfoRow label="Ngày tạo" value="20/08/2026 • 09:12" numeric />
            {/* `value` là PHẦN TỬ (Badge) — KHÔNG bị `truncate`, nơi gọi tự lo bề ngang. */}
            <InfoRow label="Wings" value={<Badge tone="danger">Không kết nối được</Badge>} />
          </dl>
        </Card>
      </Row>
      <Row note="`stack` — nhãn trên, giá trị dưới; cho ngăn kéo nhiều cột, nơi nhãn dài mà bề ngang hẹp">
        <Card className="w-full max-w-lg">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <InfoRow layout="stack" label="Gói" value="Doanh nghiệp" />
            <InfoRow layout="stack" label="Mã dịch vụ" value="SUB-10482" numeric />
            <InfoRow layout="stack" label="Hết hạn" value="30/09/2026" numeric />
          </dl>
        </Card>
      </Row>
      <Row note="`size='sm'` — hạ giá trị xuống `text-caption`. Cho cụm siêu dữ liệu ở HÀNG TIÊU ĐỀ thẻ, nơi `text-body` làm nó to ngang chữ trong thân thẻ. Tập ĐÓNG hai bậc, nơi gọi không truyền class cỡ vào được.">
        <Card className="w-full max-w-lg">
          <CardHeader
            title="Tài nguyên"
            action={
              <dl className="flex items-center gap-3.5 rounded-lg bg-surface-2 px-3.5 py-1.5">
                <InfoRow size="sm" numeric icon={CalendarIcon} label="Thời gian tạo" value="08/09/2026 • 14:30" />
                <InfoRow
                  size="sm"
                  numeric
                  icon={ClockCounterClockwiseIcon}
                  className="border-l border-stroke pl-3.5"
                  label="Triển khai gần nhất"
                  value="08/09/2026 • 14:30"
                />
              </dl>
            }
          />
        </Card>
      </Row>
      <Row note="`icon` tuỳ chọn — gắn khi vài hàng cần dấu nhận biết, KHÔNG gắn cho cả mười mục của một ngăn kéo">
        <Card className="w-full max-w-lg">
          <dl className="space-y-2.5">
            <InfoRow icon={ShieldIcon} label="Vai trò" value="Quản trị viên" />
            <InfoRow icon={CalendarIcon} label="Ngày tham gia" value="12/03/2026" numeric />
          </dl>
        </Card>
      </Row>
    </Stack>
  );
}

function InfoTileDemo() {
  return (
    <Stack>
      <Row note="`stack` — xếp lưới trong thẻ, giá trị thẳng cột nên so được giữa nhiều thẻ (hạn mức gói)">
        <div className="grid w-full max-w-lg grid-cols-2 gap-2">
          <InfoTile icon={RocketIcon} label="Số dịch vụ" value="50 dịch vụ" />
          <InfoTile icon={CpuIcon} label="CPU" value="16 core" />
          <InfoTile icon={MemoryIcon} label="RAM" value="32 GB" />
          <InfoTile icon={HardDriveIcon} label="Lưu trữ" value="100 GB" />
        </div>
      </Row>
      <Row note="`row` + thanh đo — một phép đo CÓ mẫu số (chỉ số node)">
        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile layout="row" icon={CpuIcon} label="CPU" value="42%" progress={42} progressTone="teal" />
          <InfoTile layout="row" icon={MemoryIcon} label="RAM" value="88%" progress={88} progressTone="amber" />
        </div>
      </Row>
      <Row note="`progress={null}` = CHƯA đo được (thanh rỗng) — khác hẳn `undefined` là ô vốn không có thanh">
        <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoTile layout="row" icon={HardDriveIcon} label="Đĩa" value="—" progress={null} />
          <InfoTile layout="row" label="Mạng" value="chưa có mẫu" />
        </div>
      </Row>
    </Stack>
  );
}

function StatCardDemo() {
  return (
    <Stack>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={GlobeIcon} label="Tổng website" value={0} desc="Tất cả website của bạn" />
        <StatCard icon={RocketIcon} label="Trực tuyến" value={12} desc="Đang hoạt động bình thường" />
        <StatCard icon={DatabaseIcon} label="Cơ sở dữ liệu" value={17} desc="Cơ sở dữ liệu đang chạy" />
        <StatCard icon={TrashIcon} label="Thất bại" value={3} desc="Website gặp sự cố" tone="danger" />
      </div>
      <Row note="đang tải — Skeleton giữ nguyên chiều cao ô">
        <div className="w-56">
          <StatCard icon={GlobeIcon} label="Tổng website" value={0} desc="Đang tải…" loading />
        </div>
      </Row>
    </Stack>
  );
}

/** Khoá = `name` trong manifest.ts. Trang /dsvh tra theo khoá này. */
export const dsDemos: Record<string, (() => ReactNode) | undefined> = {
  Button: ButtonDemo,
  Badge: BadgeDemo,
  Switch: SwitchDemo,
  Input: InputDemo,
  Textarea: TextareaDemo,
  Select: SelectDemo,
  "Card / CardHeader": CardDemo,
  Progress: ProgressDemo,
  Spinner: SpinnerDemo,
  Skeleton: SkeletonDemo,
  Avatar: AvatarDemo,
  PageShell: PageShellDemo,
  Tabs: TabsDemo,
  TabsNav: TabsNavDemo,
  Accordion: AccordionDemo,
  SegmentedControl: SegmentedControlDemo,
  Slider: SliderDemo,
  Pagination: PaginationDemo,
  Table: TableDemo,
  Modal: ModalDemo,
  Combobox: ComboboxDemo,
  DropdownMenu: DropdownMenuDemo,
  SocialButton: SocialButtonDemo,
  PasswordInput: PasswordInputDemo,
  AuthCard: AuthCardDemo,
  SubdomainInput: SubdomainInputDemo,
  Checkbox: CheckboxDemo,
  RadioGroup: RadioGroupDemo,
  FormField: FormFieldDemo,
  SecretInput: SecretInputDemo,
  KeyValueEditor: KeyValueEditorDemo,
  PinInput: PinInputDemo,
  Breadcrumb: BreadcrumbDemo,
  Tag: TagDemo,
  Kbd: KbdDemo,
  Empty: EmptyDemo,
  /* Trang riêng của từng ô bảng dùng CHÍNH demo đang hiện trong tài liệu Table — một nguồn, hiện
     ở hai chỗ. Trước bản này 14 trang ô hoàn toàn không có gì để nhìn. */
  ...tableCellDemos,
  "List / ListItem": ListDemo,
  StatusDot: StatusDotDemo,
  Separator: SeparatorDemo,
  Alert: AlertDemo,
  "ToastProvider / useToast": ToastDemo,
  Drawer: DrawerDemo,
  Popover: PopoverDemo,
  Command: CommandDemo,
  ConfirmDialog: ConfirmDialogDemo,
  UploadModal: UploadModalDemo,
  Tooltip: TooltipDemo,
  CopyButton: CopyButtonDemo,
  Stepper: StepperDemo,
  StatTile: StatTileDemo,
  LogViewer: LogViewerDemo,
  MetricGauge: MetricGaugeDemo,
  "TreeGuide · TreeRow": TreeGuideDemo,
  ResourceMeter: ResourceMeterDemo,
  TableToolbar: TableToolbarDemo,
  DBTypeCard: DBTypeCardDemo,
  CredentialCard: CredentialCardDemo,
  AppCard: AppCardDemo,
  TemplateGallery: TemplateGalleryDemo,
  DNSRecordTable: DNSRecordTableDemo,
  DangerZone: DangerZoneDemo,
  RepoPicker: RepoPickerDemo,
  SourcePicker: SourcePickerDemo,
  DeploymentTimeline: DeploymentTimelineDemo,
  FileUpload: FileUploadDemoWrap,
  "Chart kit (C / gridProps / cursorLine / TooltipCard / axisTick)": ChartKitDemo,
  Reveal: RevealDemo,
  CountUp: CountUpDemoLive,
  PeriodPill: PeriodPillDemo,
  "KebabButton / IconGhostButton / TileKebabDropdown": KebabDemo,
  LegendDot: LegendDotDemo,
  PageHeader: PageHeaderDemo,
  InfoRow: InfoRowDemo,
  InfoTile: InfoTileDemo,
  StatCard: StatCardDemo,
};

/* ─── Demo minh hoạ cho TÀI LIỆU NỀN (docs-data.ts) ────────────────────────────
 * Khoá trùng tên component minh hoạ ở trang /dsvh cũ. Cái nào phụ thuộc màn hình
 * riêng của hệ cũ (AppShellDemo, SidebarDemo, AssistantDemo, DashboardDemo) thì KHÔNG dựng lại —
 * vays-panel có shell/sidebar riêng, dựng bản thứ hai là vi phạm luật "một Sidebar duy nhất".
 * Gallery sẽ hiện nhãn nói rõ, kèm đường dẫn trang thật để xem tận nơi.
 */

function TypeScale() {
  const rows: [string, string, string][] = [
    ["text-hero", "34", "Số lớn nhất / hero"],
    ["text-kpi", "28", "Số KPI"],
    ["text-page", "24", "Tiêu đề trang"],
    ["text-title", "16", "Tiêu đề thẻ"],
    ["text-body", "14", "Nội dung chính"],
    ["text-caption", "12", "Chữ phụ"],
    ["text-meta", "11", "Meta"],
    ["text-micro", "10", "Nhãn siêu nhỏ"],
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map(([cls, px, role]) => (
        <div key={cls} className="flex flex-wrap items-baseline gap-3">
          <span className={`${cls} font-semibold text-ink`}>Aa Vibe Host</span>
          <code className="text-meta text-ink-3">{cls} · {px}px</code>
          <span className="text-meta text-ink-3">{role}</span>
        </div>
      ))}
    </div>
  );
}

function SpacingScale() {
  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4, 6, 8, 12].map((n) => (
        <div key={n} className="flex items-center gap-3">
          <span className="h-3 bg-orange" style={{ width: n * 4 }} />
          <code className="text-meta text-ink-3">
            {n} = {n * 4}px
          </code>
        </div>
      ))}
    </div>
  );
}

function RadiusGrid() {
  const rows: [string, string][] = [
    ["rounded-md", "6px · control nhỏ"],
    ["rounded-lg", "8px · nút / input"],
    ["rounded-xl", "12px · nút lớn / nav"],
    ["rounded-card", "16px · thẻ"],
    ["rounded-3xl", "24px · vỏ ngoài"],
    ["rounded-full", "pill / avatar"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {rows.map(([cls, note]) => (
        <div key={cls} className="flex items-center gap-2">
          <span className={`size-10 shrink-0 border-2 border-orange bg-surface-2 ${cls}`} />
          <div className="min-w-0">
            <code className="block text-caption text-ink">{cls}</code>
            <span className="text-meta text-ink-3">{note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShadowGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {["shadow-sm", "shadow-md", "shadow-lg"].map((cls) => (
        <div key={cls} className={`rounded-card bg-surface p-4 ${cls}`}>
          <code className="text-caption text-ink-2">{cls}</code>
        </div>
      ))}
    </div>
  );
}



function HoverLiftDemo() {
  return (
    <div className="w-56 rounded-card border border-stroke bg-surface p-4 transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-md">
      <p className="text-body text-ink-2">Rê chuột lên thẻ này</p>
    </div>
  );
}

function ProgressBarDemo() {
  return (
    <div className="w-64">
      <Progress value={72} showValue />
    </div>
  );
}


/* ─── Demo cho TÀI LIỆU NỀN (thay placeholder + bù 9 mục chưa có) ─────────────── */

const CHART_DATA = [
  { m: "T1", v: 12400, u: 8200 }, { m: "T2", v: 15100, u: 9400 },
  { m: "T3", v: 14200, u: 10100 }, { m: "T4", v: 18600, u: 11800 },
  { m: "T5", v: 21300, u: 13200 }, { m: "T6", v: 24800, u: 15600 },
];

/**
 * Hai dãy của biểu đồ mẫu — khai MỘT chỗ, dùng cho CẢ chú giải LẪN tooltip.
 *
 * `TooltipCard` của kit nhận `{title, rows}`, KHÔNG phải shape Recharts truyền vào
 * (`active/payload/label`) — nên luôn phải có một lớp dịch ở giữa. Trước 14/08/2026 lớp dịch đó là
 * `ChartTip` viết tay ngay tại đây, khoá cứng theo `CHART_DATA`; nó đọc được nhưng KHÔNG dùng lại
 * được, nên ba thẻ ở /admin/reports mỗi thẻ lại chép một bản nội tuyến. Nay lớp dịch nằm ở kit
 * (`chartTooltip`) và bản mẫu này dùng đúng thứ mà nơi khác cũng dùng — đó mới là điều một bản mẫu
 * cần chứng minh.
 */
const CHART_SERIES = [
  { key: "v", label: "Lượt truy cập", color: C.orange, format: (n: number) => n.toLocaleString("vi-VN") },
  { key: "u", label: "Người dùng", color: C.teal, format: (n: number) => n.toLocaleString("vi-VN") },
] as const;

/** Chart THẬT bằng Recharts + kit — minh chứng luật 5, không phải ảnh tĩnh. */
function ChartsDemo() {
  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-4">
        {CHART_SERIES.map((s) => (
          <LegendDot key={s.key} color={s.color} label={s.label} />
        ))}
      </div>
      {/* `chartFrame` — BẢN MẪU CŨNG PHẢI ĐÚNG. Đo 14/08/2026: trang này ở theme tối vẽ lưới
          #eef2f2 trên nền #22232e, tức gần trắng, sáng hơn cả dữ liệu. Lỗi nằm ở chỗ `C` là palette
          của theme SÁNG (viết cứng vì Recharts không nhận `var()`), nên một bản mẫu không có lớp
          bọc này sẽ dạy người đọc chép lại đúng lỗi đó. */}
      <div className={`h-56 w-full ${chartFrame}`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="gV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.orange} stopOpacity={0.28} />
                <stop offset="100%" stopColor={C.orange} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.teal} stopOpacity={0.24} />
                <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="m" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <RTooltip cursor={cursorLine} content={chartTooltip(CHART_SERIES)} />
            <Area type="monotone" dataKey="v" stroke={C.orange} strokeWidth={2} fill="url(#gV)" />
            <Area type="monotone" dataKey="u" stroke={C.teal} strokeWidth={2} fill="url(#gU)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-caption text-ink-3">
        Dùng đúng kit: <code className="rounded bg-stroke-soft px-1">gridProps</code> ·{" "}
        <code className="rounded bg-stroke-soft px-1">axisTick</code> ·{" "}
        <code className="rounded bg-stroke-soft px-1">cursorLine</code> ·{" "}
        <code className="rounded bg-stroke-soft px-1">TooltipCard</code> · màu từ{" "}
        <code className="rounded bg-stroke-soft px-1">C</code>.
      </p>
    </div>
  );
}

/** Khung so sánh ✅/❌ — dùng cho các mục nguyên tắc, vốn chỉ có chữ. */
function Compare({ good, bad }: { good: { t: string; body: ReactNode }; bad: { t: string; body: ReactNode } }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-teal/40 bg-teal/5 p-3">
        <p className="mb-2 text-caption font-semibold text-teal">✅ {good.t}</p>
        {good.body}
      </div>
      <div className="rounded-lg border border-red/40 bg-red/5 p-3">
        <p className="mb-2 text-caption font-semibold text-red">❌ {bad.t}</p>
        {bad.body}
      </div>
    </div>
  );
}

function PrinciplesDemo() {
  return (
    <Compare
      good={{ t: "Phân cấp bằng MÀU", body: (<div><p className="text-body text-ink">Tiêu đề thẻ</p><p className="text-body text-ink-2">Nội dung chính</p><p className="text-body text-ink-3">Ghi chú phụ</p></div>) }}
      bad={{ t: "Phân cấp bằng nhiều cỡ chữ", body: (<div><p className="text-title text-ink">Tiêu đề thẻ</p><p className="text-body text-ink">Nội dung chính</p><p className="text-meta text-ink">Ghi chú phụ</p></div>) }}
    />
  );
}

// ds-allow-hex: chuỗi dưới đây CỐ Ý trưng hex hardcode — nó là ví dụ ❌ của chính mục "Nên/Không
// nên". Gate bắt được nó chứng tỏ gate chạy đúng; đây là ngoại lệ có chủ đích, không phải nợ.
const DONT_HEX_SNIPPET = `<div style={{\n  background: "#ffffff",\n  color: "#001d21" }} />`;

function DoDontDemo() {
  return (
    <Compare
      good={{ t: "Dùng semantic token", body: <pre className="text-meta text-ink-2">{`<div className="bg-surface\n  text-ink border-stroke" />`}</pre> }}
      bad={{ t: "Hardcode hex", body: <pre className="text-meta text-ink-2">{DONT_HEX_SNIPPET}</pre> }}
    />
  );
}

function WordingDemo() {
  return (
    <Compare
      good={{ t: "Nói việc người dùng làm", body: (<div className="flex flex-col gap-2"><Button size="sm">Triển khai dự án</Button><p className="text-caption text-ink-2">Không xoá được vì dự án đang chạy. Hãy dừng trước.</p></div>) }}
      bad={{ t: "Nói việc hệ thống làm", body: (<div className="flex flex-col gap-2"><Button size="sm" variant="ghost">Submit</Button><p className="text-caption text-ink-2">Error 409: resource conflict.</p></div>) }}
    />
  );
}

function A11yDemo() {
  return (
    <Compare
      good={{ t: "Nút chỉ-icon có aria-label + Tooltip", body: (<Tooltip content="Xoá"><Button size="icon" variant="ghost" aria-label="Xoá dự án"><TrashIcon size={18} /></Button></Tooltip>) }}
      bad={{ t: "Icon trần, screen reader đọc rỗng", body: <Button size="icon" variant="ghost"><TrashIcon size={18} /></Button> }}
    />
  );
}

function GridDemo() {
  return (
    <Stack>
      <Row note="12 cột — khung lưới cơ bản">
        <div className="grid w-full grid-cols-12 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 rounded bg-orange/15 text-center text-micro leading-10 text-orange">{i + 1}</div>
          ))}
        </div>
      </Row>
      <Row note="span thường dùng">
        <div className="grid w-full grid-cols-12 gap-2">
          <div className="col-span-8 h-10 rounded bg-teal/15 text-center text-meta leading-10 text-teal">col-span-8 · nội dung</div>
          <div className="col-span-4 h-10 rounded bg-ink-3/15 text-center text-meta leading-10 text-ink-2">col-span-4 · phụ</div>
        </div>
      </Row>
    </Stack>
  );
}

function ResponsiveDemo() {
  return (
    <Stack>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {["sm", "md", "lg", "xl"].map((b) => (
          <div key={b} className="rounded-lg border border-stroke bg-surface p-3 text-center text-caption text-ink-2">{b}</div>
        ))}
      </div>
      <p className="text-caption text-ink-3">
        Thu hẹp cửa sổ để thấy lưới đổi: 1 cột → <code className="rounded bg-stroke-soft px-1">sm:</code> 2 cột →{" "}
        <code className="rounded bg-stroke-soft px-1">lg:</code> 4 cột. Luôn mobile-first.
      </p>
    </Stack>
  );
}

function InstallationDemo() {
  return (
    <Stack>
      <pre className="overflow-x-auto rounded-lg border border-stroke bg-surface-2 p-3">
        <code className="text-caption text-ink-2">{`import { Button } from "@/components/dsvh/ui/Button";
import { Card } from "@/components/dsvh/ui/Card";

<Card><Button>Bấm</Button></Card>`}</code>
      </pre>
      <Row note="kết quả">
        <Card className="w-56"><Button>Bấm</Button></Card>
      </Row>
    </Stack>
  );
}

/** 3 trạng thái bắt buộc của mọi màn có dữ liệu. */
function StatesDemo() {
  const [st, setSt] = useState<"loading" | "empty" | "error">("loading");
  return (
    <Stack>
      <SegmentedControl
        value={st}
        onChange={setSt}
        options={[
          { value: "loading", label: "Đang tải" },
          { value: "empty", label: "Trống" },
          { value: "error", label: "Lỗi" },
        ]}
      />
      <div className="rounded-card border border-stroke bg-surface p-4">
        {st === "loading" ? (
          <div className="flex flex-col gap-2">
            <Skeleton variant="text" className="h-4 w-48" />
            <Skeleton variant="text" className="h-4 w-full" />
            <Skeleton variant="rect" className="h-24 w-full" />
          </div>
        ) : st === "empty" ? (
          <Empty title="Chưa có dữ liệu" description="Tạo mục đầu tiên để bắt đầu." action={<Button size="sm">Tạo mới</Button>} />
        ) : (
          <Alert tone="error" title="Không tải được dữ liệu">Kiểm tra kết nối rồi thử lại.</Alert>
        )}
      </div>
    </Stack>
  );
}

/** Dashboard mẫu — ghép StatTile + CountUp + Reveal + chart kit theo recipe KPI. */
function DashboardPatternDemo() {
  return (
    <Reveal>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Lượt truy cập" value={<CountUp end={24800} />} delta="+12,4%" positive />
          <StatTile label="Dự án đang chạy" value={<CountUp end={38} />} delta="+3" positive />
          <StatTile label="Lỗi 5xx" value={<CountUp end={12} />} delta="-31%" positive={false} />
        </div>
        <Card>
          <CardHeader title="Lưu lượng 6 tháng" action={<PeriodPill />} />
          <ChartsDemo />
        </Card>
      </div>
    </Reveal>
  );
}

function AppShellPatternDemo() {
  return (
    <div className="overflow-hidden rounded-card border border-stroke">
      <div className="flex h-48">
        <div className="w-40 shrink-0 bg-canvas p-3">
          <p className="mb-3 text-meta font-semibold uppercase tracking-wide text-white/50">Rail</p>
          {["Bảng điều khiển", "Dự án", "Database"].map((x, i) => (
            <p key={x} className={`rounded px-2 py-1.5 text-caption ${i === 0 ? "bg-white/10 text-white" : "text-white/60"}`}>{x}</p>
          ))}
        </div>
        <div className="flex-1 bg-surface-2 p-3">
          <div className="mb-3 h-8 rounded-lg border border-stroke bg-surface" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 rounded-card border border-stroke bg-surface" />
            <div className="h-14 rounded-card border border-stroke bg-surface" />
          </div>
        </div>
      </div>
      <p className="border-t border-stroke bg-surface p-2 text-caption text-ink-3">
        Rail tối (<code className="rounded bg-stroke-soft px-1">bg-canvas</code>) + vùng nội dung sáng. vays-panel dùng
        shell riêng ở <code className="rounded bg-stroke-soft px-1">app/(app)/layout.tsx</code>.
      </p>
    </div>
  );
}

function IconBrowserDemo() {
  const icons = [RocketIcon, GearIcon, DatabaseIcon, GlobeIcon, ShieldIcon, HouseIcon, CardsIcon, NotepadIcon, RefreshIcon, TrashIcon, PlusIcon, ArrowRightIcon];
  return (
    <Stack>
      <div className="flex flex-wrap gap-2">
        {icons.map((I, i) => (
          <span key={i} className="grid size-10 place-items-center rounded-lg border border-stroke bg-surface text-ink-2">
            <I size={18} />
          </span>
        ))}
      </div>
      <p className="text-caption text-ink-3">
        ~1530 icon Phosphor export sẵn từ <code className="rounded bg-stroke-soft px-1">@/components/dsvh/icons</code>. Alias thủ
        công (tên/weight theo DSVH) thắng khi trùng tên.
      </p>
    </Stack>
  );
}

function ThemeDemo() {
  return (
    <Stack>
      <Row note="cùng token, hai nền">
        <div className="rounded-lg border border-stroke bg-surface p-3">
          <p className="text-caption text-ink">text-ink trên bg-surface</p>
          <p className="text-caption text-ink-3">text-ink-3</p>
        </div>
        <div className="dark rounded-lg border border-stroke bg-surface p-3">
          <p className="text-caption text-ink">text-ink trên bg-surface (.dark)</p>
          <p className="text-caption text-ink-3">text-ink-3</p>
        </div>
      </Row>
      <p className="text-caption text-ink-3">
        Theme đổi bằng class <code className="rounded bg-stroke-soft px-1">.dark</code> trên{" "}
        <code className="rounded bg-stroke-soft px-1">&lt;html&gt;</code> — component chỉ dùng semantic token nên tự đổi theo.
      </p>
    </Stack>
  );
}


/**
 * Bản vẽ giải phẫu trang — dựng bằng ĐÚNG component DSVH, tỉ lệ thu nhỏ.
 *
 * Đây là câu trả lời cho "làm sao biết trang mới sẽ trông thế nào": nhìn khối này rồi ghép theo
 * đúng thứ tự. Mỗi vùng có nhãn số khớp với danh sách giải phẫu ở trên.
 */
/** Nhãn số của từng vùng trong bản vẽ giải phẫu. Để NGOÀI component: khai bên trong render thì
 *  mỗi lần render lại tạo một type component mới, React phải unmount/mount lại cả cây con. */
function AnatomyTag({ n, children }: { n: number; children: ReactNode }) {
  return (
    <span className="mb-1 flex items-center gap-1.5 text-meta font-medium text-orange">
      <span className="grid size-4 place-items-center rounded-full bg-orange text-micro text-white">{n}</span>
      {children}
    </span>
  );
}

function PageAnatomyDemo() {
  return (
    <div className="overflow-hidden rounded-card border border-stroke">
      <div className="flex">
        {/* khung ngoài: rail — do layout lo, trang không dựng lại */}
        <div className="w-28 shrink-0 bg-canvas p-2">
          <p className="mb-2 text-micro font-semibold uppercase text-white/40">rail (layout)</p>
          {["Trang chủ", "Triển khai", "Database"].map((x, i) => (
            <p key={x} className={`rounded px-1.5 py-1 text-micro ${i === 0 ? "bg-white/10 text-white" : "text-white/50"}`}>{x}</p>
          ))}
        </div>

        <div className="flex-1 bg-surface-2">
          <div className="border-b border-stroke bg-surface px-3 py-1.5 text-right text-micro text-ink-3">
            topbar (layout) — ngôn ngữ · sáng/tối · tài khoản
          </div>

          {/* vùng nội dung — đúng nhịp space-y-6 p-4…lg:p-6 */}
          <div className="space-y-4 p-3">
            <div>
              <AnatomyTag n={1}>PageHeader</AnatomyTag>
              <div className="rounded-lg border border-dashed border-stroke bg-surface p-2">
                <p className="text-caption font-bold text-ink">Trang chủ</p>
                <p className="text-meta text-ink-2">Tổng quan tài nguyên và danh sách website</p>
              </div>
            </div>

            <div>
              <AnatomyTag n={2}>Hàng KPI · grid-cols-2 lg:grid-cols-4</AnatomyTag>
              <div className="grid grid-cols-4 gap-2">
                {["Tổng website", "Trực tuyến", "Thất bại", "Database"].map((l, i) => (
                  <div key={l} className="rounded-lg border border-stroke bg-surface p-2">
                    <p className="truncate text-micro text-ink-2">{l}</p>
                    <p className="text-title font-bold tabular-nums text-ink">{[0, 0, 0, 17][i]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <AnatomyTag n={3}>Card + CardHeader</AnatomyTag>
              <div className="rounded-lg border border-stroke bg-surface p-2">
                <p className="mb-1.5 text-meta font-semibold text-ink">Tài nguyên gói</p>
                <div className="grid grid-cols-4 gap-2">
                  {[53, 27, 0, 34].map((v, i) => (
                    <div key={i}>
                      <div className="h-1 rounded-full bg-stroke-soft">
                        <div className="h-1 rounded-full bg-orange" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <AnatomyTag n={4}>Dải nhắc / CTA</AnatomyTag>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-stroke bg-surface p-2">
                <p className="text-meta text-ink-2">Gắn tên miền riêng thay cho subdomain tạm</p>
                <span className="rounded bg-orange px-2 py-1 text-micro text-white">Tìm tên miền</span>
              </div>
            </div>

            <div>
              <AnatomyTag n={5}>Danh sách + trạng thái trống</AnatomyTag>
              <div className="rounded-lg border border-stroke bg-surface p-3 text-center">
                <p className="text-meta text-ink-3">Chưa có website nào</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="border-t border-stroke bg-surface p-2 text-meta text-ink-3">
        Nhịp dọc giữa các khối luôn <code className="rounded bg-stroke-soft px-1">space-y-6</code>; padding vùng nội dung{" "}
        <code className="rounded bg-stroke-soft px-1">p-4 md:p-5 lg:p-6</code>.
      </p>
    </div>
  );
}

export const docsDemos: Record<string, (() => ReactNode) | undefined> = {
  TypeScale,
  SpacingScale,
  RadiusGrid,
  ShadowGrid,
  HoverLiftDemo,
  ProgressDemo: ProgressBarDemo,
  CountUpDemo: CountUpDemoLive,
  ThemeToggleDemo: ThemeDemo,
  PhosphorBrowser: IconBrowserDemo,
  AppShellDemo: AppShellPatternDemo,
  SidebarDemo: AppShellPatternDemo,
  DashboardDemo: DashboardPatternDemo,
  AssistantDemo: () => (
    <p className="text-caption text-ink-3">
      Mẫu Assistant (3 cột + PromptInput) thuộc app cũ, vays-panel chưa có màn tương ứng. Ghi trong Sổ thiếu.
    </p>
  ),
  ChartsDemo,
  PageAnatomyDemo,
  A11yDemo,
  DoDontDemo,
  GridDemo,
  InstallationDemo,
  StatesDemo,
  PrinciplesDemo,
  ResponsiveDemo,
  WordingDemo,
};
