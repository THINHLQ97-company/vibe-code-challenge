import Link from "next/link";

import { dsDocs } from "@/components/dsvh/docs-data";
import { dsComponents, dsGaps, dsGates, dsGroupOrder } from "@/components/dsvh/manifest";
import { componentSlug, DSVH_SECTIONS } from "@/components/dsvh/slug";
import { Badge } from "@/components/dsvh/ui/Badge";

import { Playbook } from "./playbook";

import { DemoCountBadge } from "./demo-slot";

/**
 * `/dsvh` — TRANG MỤC LỤC, không còn là trang chứa tất cả.
 *
 * Bản trước dồn 73 component + 23 mục tài liệu + 7 chuyên đề vào MỘT tài liệu 775KB, tra bằng neo
 * `#c-Button`. Nay mỗi mục có địa chỉ riêng, nên trang đầu chỉ còn một việc: cho thấy có những gì và
 * đi tới đâu. Ai vào để tra một thứ cụ thể thì gõ thẳng `/dsvh/Button`, không cần qua trang này.
 *
 * Vẫn SINH TỪ `manifest.ts` như trước — cùng nguồn với `ds:check`, nên không thể lệch code: thêm
 * component mà quên khai manifest thì gate fail; đã khai thì trang tự hiện.
 *
 * `GROUP_LABEL` giữ ĐÚNG 13 nhóm ngữ nghĩa của manifest, không nhóm theo thư mục code — người tra
 * nghĩ theo "Form", "Lớp phủ", "Hiển thị dữ liệu", không nghĩ theo `ui/form`, `ui/overlay`.
 */
const GROUP_LABEL: Record<string, string> = {
  "Getting Started": "Bắt đầu",
  "Core Concepts": "Khái niệm cốt lõi",
  Foundations: "Nền tảng",
  Layout: "Bố cục",
  Components: "Component",
  Forms: "Form",
  Overlays: "Lớp phủ",
  Navigation: "Điều hướng",
  Feedback: "Phản hồi",
  "Data Display": "Hiển thị dữ liệu",
  Deploy: "Triển khai",
  Patterns: "Mẫu trang",
  Guidelines: "Nguyên tắc",
};

export default function DsvhIndexPage() {
  const groups = [...new Set([...dsGroupOrder, ...dsComponents.map((c) => c.group)])]
    .map((g) => ({
      group: g,
      components: dsComponents.filter((c) => c.group === g),
      docs: dsDocs.filter((d) => d.group === g),
    }))
    .filter((g) => g.components.length || g.docs.length);

  const openGaps = dsGaps.filter((g) => g.status === "open").length;

  return (
    <>
      <Playbook />

      <section className="mb-8 rounded-card border border-stroke bg-surface p-5">
        <h2 className="mb-1 text-title font-semibold text-ink">Mục lục</h2>
        <p className="mb-4 max-w-3xl text-caption text-ink-3">
          Mỗi mục là một trang riêng, địa chỉ đoán được:{" "}
          <code className="rounded bg-stroke-soft px-1 py-0.5">/dsvh/Button</code>,{" "}
          <code className="rounded bg-stroke-soft px-1 py-0.5">/dsvh/Table</code>. Thêm{" "}
          <code className="rounded bg-stroke-soft px-1 py-0.5">/llms.txt</code> vào cuối bất kỳ địa chỉ nào để
          lấy bản text thuần cho máy đọc.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DSVH_SECTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/dsvh/${s.slug}`}
              className="rounded-lg border border-stroke p-3 hover:border-orange"
            >
              <p className="text-body font-medium text-ink">{s.title}</p>
              <p className="mt-0.5 text-caption text-ink-3">{s.blurb}</p>
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-stroke-soft pt-4">
          <DemoCountBadge names={dsComponents.map((c) => c.name)} />
          <Badge tone="neutral" size="sm">
            {dsGates.length} phép kiểm chặn ở commit
          </Badge>
          <Badge tone={openGaps ? "warning" : "success"} size="sm">
            {openGaps} thiếu đang mở
          </Badge>
        </div>
      </section>

      {groups.map(({ group, components, docs }) => (
        <section key={group} className="mb-8">
          <h2 className="mb-1 text-caption font-semibold uppercase tracking-wide text-ink-3">
            {GROUP_LABEL[group] ?? group} <span className="font-normal normal-case">· {group}</span>
          </h2>
          <p className="mb-3 text-caption text-ink-3">
            {[
              components.length ? `${components.length} component` : null,
              docs.length ? `${docs.length} mục tài liệu` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {docs.map((d) => (
              <Link
                key={d.id}
                href={`/dsvh/${d.id}`}
                className="rounded-lg border border-stroke bg-surface p-3 hover:border-orange"
              >
                <p className="flex flex-wrap items-center gap-2 text-body font-medium text-ink">
                  {d.title}
                  <Badge tone="neutral" size="sm">
                    tài liệu
                  </Badge>
                </p>
              </Link>
            ))}
            {components.map((c) => (
              <Link
                key={c.name}
                href={`/dsvh/${componentSlug(c.name)}`}
                className="rounded-lg border border-stroke bg-surface p-3 hover:border-orange"
              >
                <p className="truncate text-body font-medium text-ink">{c.name}</p>
                {/* Kẹp mô tả ở 2 dòng: thẻ trong lưới phải cao gần bằng nhau thì mắt mới quét được
                    cả cột, mà mô tả trong manifest dài ngắn rất khác nhau. */}
                <p className="mt-0.5 line-clamp-2 text-caption text-ink-3">{c.purpose}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
