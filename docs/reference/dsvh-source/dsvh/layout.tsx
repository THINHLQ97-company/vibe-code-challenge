import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { dsDocs } from "@/components/dsvh/docs-data";
import { dsComponents, dsGroupOrder, dsRecipes } from "@/components/dsvh/manifest";
import { componentSlug, DSVH_SECTIONS } from "@/components/dsvh/slug";
import { tokenGroups } from "@/components/dsvh/tokens-data";
import { Badge } from "@/components/dsvh/ui/Badge";

import { DocsSidebar } from "./sidebar";

/**
 * KHUNG CHUNG của mọi trang `/dsvh/**` — đầu trang + mục lục dính bên trái.
 *
 * Đặt ở layout chứ không lặp trong từng trang: mục lục là thứ phải GIỐNG NHAU tuyệt đối ở mọi trang
 * con, và Next giữ nguyên cây layout khi điều hướng nội bộ nên cột trái không dựng lại, không nhấp
 * nháy, không mất vị trí cuộn khi bấm từ component này sang component khác.
 *
 * Chặn production ở đây một lần cho cả nhánh — trước đây mỗi route phải tự nhớ gọi `notFound()`.
 */
export const metadata = { title: "DSVH — Design System" };

export default function DsvhLayout({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();

  const nav = dsComponents.map((c) => ({
    name: c.name,
    slug: componentSlug(c.name),
    group: c.group,
    purpose: c.purpose,
    looksLike: c.looksLike ?? [],
    partOf: c.partOf ?? null,
  }));
  const docs = dsDocs.map((d) => ({ id: d.id, title: d.title, group: d.group }));

  return (
    <div className="min-h-screen bg-surface-2">
      {/* 1600px = ĐÚNG trần bề rộng của chính app. Trước bản này trang tài liệu hẹp hơn sản phẩm
          (1024px), nên demo bảng/biểu đồ bị bóp và không đại diện cho thứ sẽ chạy thật. */}
      <div className="mx-auto max-w-[1600px] px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dsvh" className="text-hero font-bold text-ink hover:text-orange">
              DSVH
            </Link>
            <Badge tone="accent">{dsComponents.length} component</Badge>
            <Badge tone="neutral">{tokenGroups.reduce((n, g) => n + g.tokens.length, 0)} token</Badge>
            <Badge tone="neutral">{dsDocs.length} mục tài liệu</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-body text-ink-2">
            Design system của vays-panel. Mọi trang ở đây <strong>sinh từ</strong>{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">src/components/dsvh/manifest.ts</code>{" "}
            — cùng nguồn với gate{" "}
            <code className="rounded bg-stroke-soft px-1 py-0.5 text-caption">npm run ds:check</code>, nên không
            thể lệch với code.
          </p>
        </header>

        {/* HAI CỘT kiểu tài liệu Tailwind: mục lục dính bên trái, nội dung bên phải.
            `minmax(0,1fr)` cho cột nội dung — thiếu nó thì bảng/khối mã rộng đẩy tràn cả lưới. */}
        <div className="grid gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <DocsSidebar
            components={nav}
            docs={docs}
            order={dsGroupOrder}
            sections={[...DSVH_SECTIONS]}
            recipes={dsRecipes.map((r) => ({ id: r.id, title: r.title, looksLike: r.looksLike }))}
          />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
