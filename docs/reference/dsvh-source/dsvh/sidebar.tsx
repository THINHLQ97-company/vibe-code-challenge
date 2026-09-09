"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Input } from "@/components/dsvh/ui/Input";

type NavItem = { name: string; slug: string; group: string; purpose: string; looksLike: string[]; partOf: string | null };
type DocItem = { id: string; title: string; group: string };
type Section = { slug: string; title: string; blurb: string };
type RecipeItem = { id: string; title: string; looksLike: string[] };

/**
 * MỤC LỤC DÍNH của `/dsvh` — khuôn tài liệu Tailwind: cột trái tra cứu, cột phải nội dung.
 *
 * Mỗi mục nay là một LIÊN KẾT THẬT (`/dsvh/Button`), không còn là neo `#c-Button`. Khác biệt không
 * chỉ ở địa chỉ: với neo thì mọi mục nằm chung một tài liệu, ai muốn đọc một component vẫn phải tải
 * cả trang và rất dễ đọc lẫn sang mục kế bên; với route thật thì mỗi mục có biên rõ ràng.
 *
 * Ô lọc ở đây lọc MỤC LỤC, không lọc nội dung: người tra thường đã biết đại khái tên, cần đường tới
 * chỗ đó chứ không cần trang bị cắt bớt.
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

export function DocsSidebar({
  components,
  docs,
  order,
  sections,
  recipes,
}: {
  components: NavItem[];
  docs: DocItem[];
  order: string[];
  sections: Section[];
  recipes: RecipeItem[];
}) {
  const [q, setQ] = useState("");
  const pathname = usePathname();

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const hitC = (c: NavItem) =>
      !s ||
      c.name.toLowerCase().includes(s) ||
      c.purpose.toLowerCase().includes(s) ||
      // Lọc CẢ theo từ khoá nhận diện: gõ "menu ba chấm" phải ra được, không bắt phải biết trước
      // rằng thứ mình cần tên là `TableActionsCell`.
      c.looksLike.some((k) => k.toLowerCase().includes(s));
    const hitD = (d: DocItem) => !s || d.title.toLowerCase().includes(s) || d.id.includes(s);

    const byGroup = new Map<string, { href: string; label: string; doc?: boolean; con?: boolean }[]>();
    const push = (g: string, item: { href: string; label: string; doc?: boolean; con?: boolean }) => {
      if (!byGroup.has(g)) byGroup.set(g, []);
      byGroup.get(g)!.push(item);
    };
    for (const d of docs.filter(hitD)) push(d.group, { href: `/dsvh/${d.id}`, label: d.title, doc: true });
    /* Mục CON không đứng ngang hàng với mục cha — chúng nằm LỒNG dưới cha, thụt vào.
       14 ô bảng từng thành 14 dòng phẳng ngay trên `Table`, tên na ná nhau: đúng thứ làm mục lục
       rối mà trang này sinh ra để dẹp. Khi ĐANG LỌC thì hiện phẳng, vì lúc đó người ta tìm theo tên
       chứ không duyệt theo cây. */
    const hits = components.filter(hitC);
    const conCua = new Map<string, NavItem[]>();
    if (!s) for (const c of hits) if (c.partOf) conCua.set(c.partOf, [...(conCua.get(c.partOf) ?? []), c]);
    for (const c of hits) {
      if (!s && c.partOf) continue;
      push(c.group, { href: `/dsvh/${c.slug}`, label: c.name });
      for (const k of conCua.get(c.name) ?? [])
        push(c.group, { href: `/dsvh/${k.slug}`, label: k.name, con: true });
    }

    return [...new Set([...order, ...byGroup.keys()])]
      .map((g) => [g, byGroup.get(g) ?? []] as const)
      .filter(([, items]) => items.length > 0);
  }, [components, docs, order, q]);

  const link = (href: string, label: string, extra = "") => {
    const active = pathname === href;
    return (
      <li key={href}>
        <Link
          href={href}
          aria-current={active ? "page" : undefined}
          className={`block truncate rounded-md px-2 py-1 text-caption ${
            active ? "bg-orange/10 font-medium text-orange" : "text-ink-2 hover:bg-stroke-soft hover:text-ink"
          } ${extra}`}
        >
          {label}
        </Link>
      </li>
    );
  };

  return (
    /* `sticky top-6` + `max-h`/`overflow-y-auto`: mục lục đứng yên khi cuộn nội dung, và tự cuộn
       riêng khi nó dài hơn màn. Ẩn dưới `lg` — màn hẹp thì hai cột thành hai lần cuộn chồng nhau. */
    <aside className="hidden lg:block">
      <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2 scrollbar-none">
        <Input
          placeholder="Lọc mục…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Lọc mục trong mục lục"
          size="sm"
        />

        <nav aria-label="Mục lục design system" className="mt-4 space-y-5">
          <div>
            <p className="mb-1.5 text-meta font-semibold uppercase tracking-wider text-ink-3">Tra cứu nhanh</p>
            <ul className="space-y-0.5">
              {link("/dsvh", "Tổng quan")}
              {sections
                .filter((s) => !q.trim() || s.title.toLowerCase().includes(q.trim().toLowerCase()))
                .map((s) => link(`/dsvh/${s.slug}`, s.title))}
              <li>
                <a
                  href="/dsvh/llms.txt"
                  className="block rounded-md px-2 py-1 text-caption font-medium text-orange hover:bg-stroke-soft"
                >
                  llms.txt — bản cho máy đọc
                </a>
              </li>
            </ul>
          </div>

          {/* Công thức ghép cụm đứng RIÊNG một nhóm, ngay trên các nhóm component: chúng không phải
              component, và phần lớn thứ trên một màn thật là cụm ghép chứ không phải component đơn lẻ. */}
          {(() => {
            const s2 = q.trim().toLowerCase();
            const hits = recipes.filter(
              (r) => !s2 || r.title.toLowerCase().includes(s2) || r.looksLike.some((k) => k.toLowerCase().includes(s2)),
            );
            if (!hits.length) return null;
            return (
              <div>
                <p className="mb-1.5 text-meta font-semibold uppercase tracking-wider text-ink-3">
                  Công thức ghép cụm
                </p>
                <ul className="space-y-0.5">{hits.map((r) => link(`/dsvh/${r.id}`, r.title))}</ul>
              </div>
            );
          })()}

          {groups.map(([g, items]) => (
            <div key={g}>
              <p className="mb-1.5 text-meta font-semibold uppercase tracking-wider text-ink-3">
                {GROUP_LABEL[g] ?? g}
              </p>
              <ul className="space-y-0.5">{items.map((it) => link(it.href, it.label, it.con ? "ml-3 border-l border-stroke-soft pl-2" : ""))}</ul>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="px-2 text-caption text-ink-3">Không có mục nào khớp “{q}”.</p>
          )}
        </nav>
      </div>
    </aside>
  );
}
