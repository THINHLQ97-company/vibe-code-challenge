import type { ReactNode } from "react";

import {
  ArrowDownIcon,
  ArrowUUpLeftIcon,
  ChatCircleTextIcon,
  CheckCircleIcon,
  FileTextIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  StackIcon,
  WarningCircleIcon,
} from "@/components/dsvh/icons";
import { dsGates } from "@/components/dsvh/manifest";
import { Badge } from "@/components/dsvh/ui/Badge";

/**
 * `<Flow />` — SƠ ĐỒ NGUYÊN LÝ của DSVH: từ lúc nhận yêu cầu tới lúc thay đổi có mặt trên sản phẩm.
 *
 * Vì sao trang tài liệu cần một sơ đồ, trong khi nó đã liệt kê đủ 72 component và 15 luật: danh
 * sách trả lời "có những gì", không trả lời "làm việc ra sao". Người mới đọc hết `/dsvh` vẫn không
 * biết phải tra manifest TRƯỚC khi dựng, và không biết vì sao một góp ý về màu icon lại phải kết
 * thúc bằng một phép kiểm chứ không phải một dòng ghi chú. Hai điều đó là toàn bộ nguyên lý, và
 * trước bản này chúng chỉ sống trong đầu vài người.
 *
 * Sơ đồ dựng bằng CHÍNH token DSVH (không hex, không SVG tay, icon Phosphor, 8 bậc chữ) — một sơ
 * đồ nói về design system mà vẽ ngoài design system thì tự nó đã phản bác nội dung nó trình bày.
 */

/** Một đốt của luồng: số thứ tự · icon · tiêu đề · diễn giải · ghi chú phụ. */
function Step({
  n,
  icon,
  title,
  desc,
  children,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-card border border-stroke bg-surface p-4">
      {/* Chấm số + chấm icon giữ TRUNG TÍNH (luật #8): chúng chỉ đánh dấu vị trí trong luồng,
          không mang nghĩa trạng thái. */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-stroke-soft text-caption font-semibold text-ink-2">
          {n}
        </span>
        <span className="text-ink-3">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-body font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-caption text-ink-2">{desc}</p>
        {children ? <div className="mt-3">{children}</div> : null}
      </div>
    </div>
  );
}

/** Mũi tên nối hai đốt — luôn hướng XUỐNG, để mắt đọc sơ đồ như đọc một câu. */
function Down() {
  return (
    <div className="flex justify-center py-1.5 text-ink-3" aria-hidden>
      <ArrowDownIcon size={18} />
    </div>
  );
}

/** Một nhánh rẽ (Có / Chưa · Đạt / Không đạt). `tone` chỉ dùng khi nhánh MANG NGHĨA đạt-hỏng. */
function Branch({
  label,
  text,
  tone = "neutral",
}: {
  label: string;
  text: string;
  tone?: "neutral" | "ok" | "bad";
}) {
  return (
    <div className="flex gap-2 rounded-lg border border-stroke bg-surface-2 p-2.5">
      <span className="shrink-0 pt-0.5">
        {tone === "ok" ? (
          <CheckCircleIcon size={16} className="text-teal" />
        ) : tone === "bad" ? (
          <WarningCircleIcon size={16} className="text-red" />
        ) : (
          /* Chấm ĐẶC `bg-ink-3` chứ không phải vòng tròn rỗng `bg-stroke-soft`: nền của thẻ này là
             `bg-surface-2`, mà ở theme tối hai màu đó gần trùng nhau nên dấu đầu dòng biến mất. */
          <span className="grid size-4 place-items-center">
            <span className="size-1.5 rounded-full bg-ink-3" />
          </span>
        )}
      </span>
      <p className="min-w-0 text-caption text-ink-2">
        <span className="font-semibold text-ink">{label}</span> — {text}
      </p>
    </div>
  );
}

export function Flow() {
  return (
    <section className="mb-8 rounded-card border border-stroke bg-surface p-5">
      <h2 className="mb-1 text-body font-semibold text-ink">Nguyên lý hoạt động</h2>
      <p className="mb-5 max-w-3xl text-caption text-ink-3">
        Từ lúc nhận một yêu cầu tới lúc thay đổi có mặt trên sản phẩm. Đọc từ trên xuống; đốt cuối
        vòng ngược lên đầu — đó là chỗ làm cho hệ này tự siết lại theo thời gian.
      </p>

      {/* ── Khối nền: một nguồn sinh ra ba đầu ra ─────────────────────────────────────────── */}
      <div className="mb-6 rounded-card border border-stroke bg-surface-2 p-4">
        <p className="mb-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
          Nền của toàn bộ sơ đồ
        </p>
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <div className="shrink-0 rounded-lg border border-stroke bg-surface p-3 text-center md:w-56">
            <p className="text-body font-semibold text-ink">manifest.ts</p>
            <p className="mt-0.5 text-meta text-ink-3">nguồn chân lý DUY NHẤT</p>
          </div>
          <div className="grid shrink-0 place-items-center text-ink-3 md:px-1" aria-hidden>
            <span className="hidden md:inline">→</span>
            <ArrowDownIcon size={18} className="md:hidden" />
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-3">
            {[
              { t: "/dsvh", d: "tài liệu người đọc — trang này" },
              { t: "npm run ds:check", d: `${dsGates.length} phép kiểm chặn ở commit` },
              { t: "code sản phẩm", d: "component thật mà trang import" },
            ].map((o) => (
              <div key={o.t} className="rounded-lg border border-stroke bg-surface p-3">
                <p className="truncate text-caption font-semibold text-ink">{o.t}</p>
                <p className="mt-0.5 text-meta text-ink-3">{o.d}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-caption text-ink-2">
          Ba đầu ra <strong className="text-ink">không thể lệch nhau</strong>, vì cùng đọc một tệp.
          Thêm component mà quên khai manifest thì gate chặn; khai rồi thì tài liệu tự hiện. Đây là
          lý do DSVH không có bước &ldquo;nhớ cập nhật tài liệu&rdquo; — không có gì để quên.
        </p>
      </div>

      {/* ── Luồng 5 đốt ──────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col">
        <Step
          n={1}
          icon={<ChatCircleTextIcon size={20} />}
          title="Nhận yêu cầu"
          desc="Chủ dự án / BA nêu một thay đổi, thường bằng ảnh chụp màn hình kèm một câu mô tả."
        >
          <p className="rounded-lg border border-stroke bg-surface-2 p-2.5 text-caption text-ink-2">
            Ví dụ thật (06/08): <em>&ldquo;Phần icon tôi muốn nó gam màu xám, để màu đó không phù
            hợp.&rdquo;</em>
          </p>
        </Step>

        <Down />

        <Step
          n={2}
          icon={<MagnifyingGlassIcon size={20} />}
          title="Tra TRƯỚC khi dựng"
          desc="Mở /dsvh hoặc đọc manifest: thứ mình sắp dựng đã có sẵn chưa? Đây là bước hay bị bỏ qua nhất, và bỏ qua nó là nguồn gốc của gần hết các lệch pha."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Branch label="Đã có" text="import và dùng lại, không dựng bản thứ hai." />
            <Branch
              label="Chưa có"
              text="viết component → khai vào manifest → thêm demo. Ba việc, không phải một."
            />
          </div>
        </Step>

        <Down />

        <Step
          n={3}
          icon={<StackIcon size={20} />}
          title="Dựng màn"
          desc="PageShell cho khung trang, component DSVH cho từng khối, token cho mọi màu và cỡ chữ."
        >
          <div className="flex flex-wrap gap-1.5">
            {["không hex", "không SVG tay", "8 bậc chữ có tên", "một font Inter", "icon Phosphor"].map(
              (r) => (
                <Badge key={r} tone="neutral" size="sm">
                  {r}
                </Badge>
              ),
            )}
          </div>
        </Step>

        <Down />

        <Step
          n={4}
          icon={<ShieldCheckIcon size={20} />}
          title="Gate chặn ở cửa"
          desc={`npm run ds:check chạy ${dsGates.length} phép kiểm trên toàn bộ tệp UI. Không đạt thì không đi tiếp.`}
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <Branch tone="ok" label="Đạt" text="commit, đẩy lên nhánh chung." />
            <Branch tone="bad" label="Không đạt" text="báo đúng tệp:dòng và cách sửa → quay lại đốt 3." />
          </div>
          <p className="mt-2 text-caption text-ink-2">
            Mỗi gate đều có <strong className="text-ink">cửa thoát khai tại chỗ</strong> —{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-meta">ds-allow-accent:</code>{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-meta">ds-allow-width:</code>{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-meta">ds-allow-hex:</code> — vì
            một luật không có ngoại lệ hợp lệ thì người ta sẽ tắt cả luật.
          </p>
        </Step>

        <Down />

        <Step
          n={5}
          icon={<FileTextIcon size={20} />}
          title="Phản hồi thành LUẬT + GATE"
          desc="Chỗ quan trọng nhất, và cũng là chỗ hệ này từng hỏng. Khi một góp ý chỉ ra cái sai, không dừng ở việc sửa chỗ đó."
        >
          <div className="flex flex-col gap-2">
            <Branch
              tone="bad"
              label="Chỉ sửa chỗ được chỉ"
              text="lần sau người khác lặp lại đúng lỗi đó ở trang khác."
            />
            <Branch
              tone="bad"
              label="Sửa + ghi luật vào manifest"
              text="vẫn trôi. Bằng chứng: luật #8 ghi 05/08, đến 07/08 vẫn còn 14 chỗ tô cam ở 10 tệp — luật không ai đọc lại."
            />
            <Branch
              tone="ok"
              label="Sửa + ghi luật + THÊM GATE"
              text="từ đó về sau máy canh thay người. Đây mới là bước kết thúc của một yêu cầu."
            />
          </div>
        </Step>
      </div>

      {/* ── Vòng lặp ngược ───────────────────────────────────────────────────────────────── */}
      <div className="mt-3 flex items-start gap-3 rounded-card border border-stroke bg-surface-2 p-4">
        <span className="shrink-0 text-ink-3" aria-hidden>
          <ArrowUUpLeftIcon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">Đốt 5 quay về đốt 2</p>
          <p className="mt-0.5 text-caption text-ink-2">
            Luật và gate mới trở thành thứ mà lần tra kế tiếp sẽ đọc được. Mỗi lần chủ dự án chỉ ra
            một cái sai, hệ <strong className="text-ink">chặt hơn vĩnh viễn</strong> chứ không chỉ
            đúng thêm một chỗ. Số phép kiểm đi từ 8 → 15 → 17 theo đúng cách đó.
          </p>
        </div>
      </div>

      {/* ── Chỗ sơ đồ này CHƯA phủ ───────────────────────────────────────────────────────── */}
      <div className="mt-3 flex items-start gap-3 rounded-card border border-amber/40 bg-amber/15 p-4">
        <span className="shrink-0 pt-0.5 text-amber-strong" aria-hidden>
          <WarningCircleIcon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-body font-semibold text-ink">Chỗ luồng này còn hở</p>
          <p className="mt-0.5 text-caption text-ink-2">
            Gate ở đốt 4 đọc <em>chữ trong tệp</em>, nên nó thấy cả code nằm sau{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-meta">step === 3</code>. Thứ nó
            KHÔNG thấy là quan hệ giữa các phần tử — &ldquo;hậu tố có nằm trong khung viền
            không&rdquo;, &ldquo;bốn dòng này có cùng cỡ chữ không&rdquo;. Còn ảnh chụp thì chỉ bắt
            được trạng thái đầu tiên của một màn. Giữa hai thứ đó là vùng trống, và những màn{" "}
            <strong className="text-ink">phải bấm mới thấy</strong> nằm trọn trong vùng đó. Hướng
            đang chốt: một <code className="rounded bg-stroke-soft px-1 py-0.5 text-meta">WizardShell</code>{" "}
            chung cho các luồng nhiều bước, để mọi trạng thái render được ngay trên trang này.
          </p>
        </div>
      </div>
    </section>
  );
}
