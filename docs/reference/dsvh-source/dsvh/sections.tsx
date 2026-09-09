import type { DocBlock, DocPage } from "@/components/dsvh/docs-data";
import { dsGaps, dsGates, dsRules, shadcnBorrowed, type Gap } from "@/components/dsvh/manifest";
import { tokenGroups, type TokenGroup } from "@/components/dsvh/tokens-data";
import { ColorSwatch } from "./color-swatch";
import { Badge } from "@/components/dsvh/ui/Badge";

import { DocDemoSlot } from "./demo-slot";

/**
 * Bảy trang chuyên đề của DSVH, mỗi trang một địa chỉ riêng (`/dsvh/luat-nen`…).
 *
 * Trước đây tất cả nằm chung `gallery.tsx` và chỉ tra được bằng neo `#luat-nen`. Tách file cho phép
 * trang chi tiết là component MÁY CHỦ (không "use client"): dữ liệu đọc thẳng từ manifest lúc dựng,
 * không phải đẩy qua props và không tốn JS phía trình duyệt cho thứ chỉ để đọc.
 */

export function Rules() {
  return (
    <ul className="flex flex-col gap-2">
      {dsRules.map((r, i) => (
        <li key={i} className="flex gap-2 text-body text-ink-2">
          <span className="shrink-0 text-orange">▸</span>
          <span>{r}</span>
        </li>
      ))}
    </ul>
  );
}

export function ShadcnBoundary() {
  return (
    <>
      <p className="mb-4 text-body text-ink-2">
        DSVH là mặc định. shadcn chỉ dùng cho primitive DSVH chưa có — phần &ldquo;trùng&rdquo; bị khoá theo
        baseline, code mới phải dùng bản DSVH.
      </p>
      <p className="mb-2 text-caption font-medium text-ink-2">Được mượn thoải mái</p>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {shadcnBorrowed.allowed.map((n) => (
          <Badge key={n} tone="neutral" size="sm">
            {n}
          </Badge>
        ))}
      </div>
      <p className="mb-2 text-caption font-medium text-ink-2">Trùng DSVH — dùng bản DSVH cho code mới</p>
      <div className="flex flex-col gap-1.5">
        {Object.entries(shadcnBorrowed.duplicated).map(([n, target]) => (
          <div key={n} className="flex flex-wrap items-center gap-2 text-caption">
            <Badge tone="warning" size="sm">
              ui/{n}
            </Badge>
            <span className="text-ink-3">→</span>
            <code className="rounded bg-stroke-soft px-1.5 py-0.5 text-ink-2">{target}</code>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Danh sách phép kiểm — đọc từ `dsGates`, KHÔNG gõ tay.
 *
 * Con số ở đây từng là chữ "17" viết thẳng trong JSX, và nó đã sai (thật ra 14). Trang tài liệu tồn
 * tại để dẹp chuyện "phải nhớ cập nhật", nên chính nó không được phạm điều đó.
 */
export function GateList() {
  return (
    <>
      <p className="mb-4 text-body text-ink-2">
        <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">npm run ds:check</code> chạy ở
        pre-commit. Mỗi phép kiểm đều có cửa thoát ghi TẠI CHỖ ở dòng vi phạm (
        <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">ds-allow-*: lý do</code>) — chặn
        không phải để cấm tuyệt đối, mà để buộc nói rõ vì sao phá luật.
      </p>
      <div className="flex flex-col gap-1.5">
        {dsGates.map((g) => (
          <div key={g.id} className="flex flex-wrap items-baseline gap-2 rounded-lg border border-stroke-soft p-2.5">
            <code className="shrink-0 text-caption font-semibold text-ink">{g.id}</code>
            <span className="text-caption text-ink-2">{g.blocks}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const GAP_TONE = {
  open: { tone: "warning" as const, label: "đang mở" },
  planned: { tone: "accent" as const, label: "đã chốt, chờ dựng" },
  borrowed: { tone: "neutral" as const, label: "mượn lâu dài" },
};

/**
 * Sổ thiếu — vế "thiếu" của luồng thiết kế. Khi màn hình cần thứ DSVH chưa có, gate REIMPL chặn
 * việc dựng lén trong module; đây là lối thoát hợp lệ để ghi lại, thay vì để nhu cầu đó biến mất.
 */
export function GapLedger({ gaps = dsGaps }: { gaps?: Gap[] }) {
  if (!gaps.length) return null;
  return (
    <>
      <p className="mb-4 text-body text-ink-2">
        Thứ giao diện cần mà DSVH chưa có. Ghi vào đây thay vì dựng lén trong module — gate{" "}
        <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">REIMPL</code> chặn việc dựng lén.
      </p>
      <div className="flex flex-col gap-3">
        {gaps.map((g) => {
          const t = GAP_TONE[g.status];
          return (
            <div key={g.need} className="rounded-lg border border-stroke-soft p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body font-medium text-ink">{g.need}</span>
                <Badge tone={t.tone} size="sm">
                  {t.label}
                </Badge>
              </div>
              <p className="mt-1 text-caption text-ink-2">{g.context}</p>
              {g.note ? <p className="mt-1 text-caption text-ink-3">{g.note}</p> : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

/**
 * Bảng token — thứ designer cần nhìn đầu tiên.
 *
 * Dữ liệu từ `tokens-data.ts`, mà file đó do `npm run ds:tokens` sinh từ `dsvh-tokens.css` và được
 * gate `TOKENSDOC` đối chiếu lại. Nên ô màu ở đây luôn là màu THẬT đang chạy, không phải bảng màu
 * chép tay rồi quên cập nhật.
 *
 * Ô màu vẽ bằng `style={{ background }}` (giá trị lấy từ dữ liệu) thay vì class Tailwind: class
 * động kiểu `bg-${name}` không tồn tại sau khi Tailwind quét tĩnh, còn đây là bảng màu nên hiển thị
 * chính giá trị mới là điều đúng.
 */
export function Tokens({ groups = tokenGroups }: { groups?: TokenGroup[] }) {
  return (
    <>
      <p className="mb-4 text-body text-ink-2">
        Gõ theo cột <span className="font-medium text-ink">Utility</span> (vd{" "}
        <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">bg-surface</code>,{" "}
        <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">text-ink-2</code>). Cột{" "}
        <span className="font-medium text-ink">Tối</span> trống = giữ nguyên màu ở theme tối.
      </p>
      <div className="flex flex-col gap-5">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">{g.label}</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Token MÀU có cách xem riêng (`ColorSwatch`): dải chia đôi sáng|tối để thấy ngay token
                  nào đổi theo theme, bấm để chép tên utility. Bo góc và cỡ chữ vẫn dùng hàng ngang
                  bên dưới — chúng không có hai giá trị để so, dựng thành dải chia đôi là vô nghĩa. */}
              {g.tokens.map((t) => t.kind === "color" ? (
                <ColorSwatch key={t.name} token={t} />
              ) : (
                <div key={t.name} className="flex items-center gap-3 rounded-lg border border-stroke-soft p-2">
                  {/* Mỗi loại token cần một cách xem RIÊNG: màu → ô tô màu, bo góc → khung bo,
                      cỡ chữ → chính chữ ở cỡ đó. Bản trước chỉ phân nhánh màu/còn-lại nên bậc chữ
                      bị vẽ như bo góc — tám ô tròn giống hệt nhau, chẳng nói lên điều gì. */}
                  {t.kind === "text" ? (
                    <span
                      className="grid h-9 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-stroke bg-surface-2 leading-none text-ink"
                      style={{ fontSize: t.light }}
                      aria-hidden
                    >
                      Aa
                    </span>
                  ) : (
                    <span
                      className="size-9 shrink-0 border-2 border-orange bg-surface-2"
                      style={{ borderRadius: t.light }}
                      aria-hidden
                    />
                  )}
                  <div className="min-w-0">
                    <code className="block truncate text-caption font-medium text-ink">{t.utility}</code>
                    <span className="text-meta text-ink-3">
                      {t.light}
                      {t.dark ? ` · tối ${t.dark}` : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * Văn xuôi có `code`, **đậm** và [liên kết](/duong-dan) — render nhẹ, không kéo thư viện markdown.
 *
 * Liên kết thêm 13/08/2026. Trước đó cú pháp `[nhãn](/url)` KHÔNG được hiểu nên nó in ra nguyên si
 * giữa câu — mục "Màu" có một dòng hiện đúng chữ `[ /dsvh.json ](/dsvh.json)`. Không lỗi, không cảnh
 * báo, chỉ trông như tài liệu viết dở. Mà đây lại chính là thứ cần nhất để các mục dẫn sang nhau
 * thay vì mỗi mục tự chép lại nội dung của mục khác.
 */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(p);
        if (link)
          return (
            <a key={i} href={link[2]} className="font-medium text-link underline decoration-link/30 underline-offset-2 hover:text-link-hover hover:decoration-link">
              {link[1]}
            </a>
          );
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code key={i} className="rounded bg-stroke-soft px-1 py-0.5 text-caption text-ink-2">
              {p.slice(1, -1)}
            </code>
          );
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold text-ink">
              {p.slice(2, -2)}
            </strong>
          );
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case "h":
      return <h3 className="mt-4 mb-1 text-title font-semibold text-ink">{block.text}</h3>;
    case "p":
      return (
        <p className="text-body leading-relaxed text-ink-2">
          <RichText text={block.text} />
        </p>
      );
    case "ul":
      return (
        <ul className="flex flex-col gap-1.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2 text-body leading-relaxed text-ink-2">
              <span className="shrink-0 text-orange">·</span>
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div className="rounded-lg border-l-2 border-orange bg-surface-2 px-3 py-2 text-caption text-ink-2">
          <RichText text={block.text} />
        </div>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg border border-stroke bg-surface-2 p-3">
          <code className="text-caption leading-relaxed text-ink-2">{block.code}</code>
        </pre>
      );
    case "table":
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stroke-soft">
                {block.head.map((h) => (
                  <th key={h} className="pb-2 pr-4 text-caption font-semibold uppercase tracking-wide text-ink-3">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-b border-stroke-soft last:border-0">
                  {r.map((c, j) => (
                    <td key={j} className="py-2 pr-4 align-top text-caption text-ink-2">
                      <RichText text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "demo":
      return <DocDemoSlot demoKey={block.key} />;
  }
}

/** Một mục tài liệu nền, mở sẵn toàn bộ — nay mỗi mục đã là một trang riêng nên không còn gì để gập. */
export function DocArticle({ page }: { page: DocPage }) {
  return (
    <div className="flex flex-col gap-3">
      {page.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}
    </div>
  );
}
