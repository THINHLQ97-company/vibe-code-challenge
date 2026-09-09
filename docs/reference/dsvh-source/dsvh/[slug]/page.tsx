import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { dsComponents, dsRecipes, type ComponentEntry, type Recipe } from "@/components/dsvh/manifest";
import {
  allDsvhSlugs,
  componentAliases,
  componentSlug,
  DSVH_SECTIONS,
  resolveDsvhSlug,
} from "@/components/dsvh/slug";
import { TableAnatomy } from "@/components/dsvh/table-anatomy";
import { Badge } from "@/components/dsvh/ui/Badge";

import { DemoSlot } from "../demo-slot";
import { RecogniseMap } from "../recognise";
import { Flow } from "../flow";
import { DocArticle, GapLedger, GateList, Rules, ShadcnBoundary, Tokens } from "../sections";

/**
 * `/dsvh/<mục>` — MỘT trang cho MỘT mục: một component, một chuyên đề, hoặc một mục tài liệu nền.
 *
 * Vì sao tách khỏi trang gộp: `/dsvh` cũ nhét cả 73 component + 23 mục tài liệu vào một tài liệu
 * 775KB, tra bằng neo `#c-Button`. Ai (hoặc AI nào) muốn biết `Button` có variant gì vẫn phải nạp
 * toàn bộ, rồi tự cắt đúng đoạn giữa hàng nghìn thẻ — cắt lệch một nhịp là đọc nhầm sang mục kế
 * bên. Một mục một địa chỉ thì biên rõ ràng, và địa chỉ đoán được nên không cần tra mục lục trước.
 *
 * Một route lo cả ba loại mục thay vì ba nhánh route: mọi thứ dưới `/dsvh/` chung một khuôn địa chỉ,
 * người tra không phải nhớ mục mình cần thuộc loại nào.
 */

export function generateStaticParams() {
  return allDsvhSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const found = resolveDsvhSlug((await params).slug);
  if (!found) return { title: "DSVH" };
  const title =
    found.kind === "component"
      ? found.entry.name
      : found.kind === "doc"
        ? found.page.title
        : found.kind === "recipe"
          ? found.recipe.title
          : (DSVH_SECTIONS.find((s) => s.slug === found.slug)?.title ?? found.slug);
  return { title: `${title} — DSVH` };
}

/** Khung chung của mọi trang con: tiêu đề + một dòng nói rõ đây là gì. */
function Head({ title, kind, children }: { title: string; kind: string; children?: React.ReactNode }) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-page font-semibold text-ink">{title}</h1>
        <Badge tone="neutral" size="sm">
          {kind}
        </Badge>
      </div>
      {children}
    </header>
  );
}

export default async function DsvhItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const raw = (await params).slug;
  /* Địa chỉ cũ của "Giải phẫu một bảng" — nội dung nay nằm trong chính trang `Table`. Chuyển hướng
     thay vì trả 404: liên kết đã phát ra trong tài liệu, commit và chat không được chết. */
  if (raw.toLowerCase() === "giai-phau-bang") redirect("/dsvh/Table");
  const found = resolveDsvhSlug(raw);
  if (!found) notFound();

  if (found.kind === "section") {
    const meta = DSVH_SECTIONS.find((s) => s.slug === found.slug)!;
    /* Hai chuyên đề tự mang tiêu đề riêng (sơ đồ luồng và bảng giải phẫu là tài liệu hoàn chỉnh,
       không phải một khối nội dung rời) nên không bọc thêm Head — bọc vào sẽ ra hai tiêu đề. */
    if (found.slug === "nguyen-ly") return <Flow />;
    if (found.slug === "cong-thuc") {
      return (
        <>
          <Head title={meta.title} kind="chuyên đề">
            <p className="mt-2 max-w-3xl text-body text-ink-2">
              Tầng giữa TOKEN và COMPONENT. Phần lớn thứ trên một màn thật là CỤM ghép từ nhiều
              component, không phải một component đơn lẻ — và trước nay không có tài liệu nào nói cụm
              ghép ra sao. Mọi công thức ở đây đều rút từ màn đang chạy thật.
            </p>
          </Head>
          <div className="grid gap-3 lg:grid-cols-2">
            {dsRecipes.map((r) => (
              <Link
                key={r.id}
                href={`/dsvh/${r.id}`}
                className="rounded-card border border-stroke bg-surface p-4 hover:border-orange"
              >
                <p className="text-body font-semibold text-ink">{r.title}</p>
                <p className="mt-0.5 text-caption text-ink-3">{r.looksLike.join(" · ")}</p>
                <p className="mt-2 text-caption text-ink-2">
                  <span className="text-ink-3">Ghép từ: </span>
                  {r.builtFrom.length ? r.builtFrom.join(" · ") : "token trần"}
                </p>
              </Link>
            ))}
          </div>
        </>
      );
    }

    if (found.slug === "tra-nguoc") {
      /* Một dòng cho MỖI từ khoá, không phải mỗi component: người tra đang cầm trong tay một cụm
         nhìn thấy, không phải một cái tên — nên đơn vị của bảng phải là cụm. */
      const rows = dsComponents.flatMap((c) =>
        (c.looksLike ?? []).map((k) => ({
          keyword: k,
          name: c.name,
          slug: componentSlug(c.name),
          group: c.group,
          purpose: c.purpose,
        })),
      ).sort((a, b) => a.keyword.localeCompare(b.keyword, "vi"));
      return (
        <>
          <Head title={meta.title} kind="chuyên đề">
            <p className="mt-2 max-w-3xl text-body text-ink-2">
              Mở màn cần làm ra, tách thành từng cụm, rồi tra từng cụm ở đây. Không thấy cụm nào trong
              bảng này nghĩa là DSVH chưa có sẵn — lúc đó mới sang Công thức ghép cụm, và cuối cùng mới
              là Sổ thiếu.
            </p>
          </Head>
          <RecogniseMap rows={rows} />
        </>
      );
    }
    return (
      <>
        <Head title={meta.title} kind="chuyên đề" />
        <section className="rounded-card border border-stroke bg-surface p-5">
          {found.slug === "luat-nen" ? (
            <Rules />
          ) : found.slug === "bang-token" ? (
            <Tokens />
          ) : found.slug === "ranh-gioi-shadcn" ? (
            <ShadcnBoundary />
          ) : found.slug === "phep-kiem" ? (
            <GateList />
          ) : (
            <GapLedger />
          )}
        </section>
      </>
    );
  }

  if (found.kind === "recipe") return <RecipePage recipe={found.recipe} />;

  if (found.kind === "doc") {
    const d = found.page;
    return (
      <>
        <Head title={d.title} kind="tài liệu nền">
          <code className="mt-1 block text-meta text-ink-3">nguồn: /dsvh/{d.origin}</code>
        </Head>
        <section className="rounded-card border border-stroke bg-surface p-5">
          <DocArticle page={d} />
        </section>
        {d.related?.length ? (
          /* Tài liệu nền phải dẫn được XUỐNG component, nếu không nó chỉ là kiến thức chứ không
             thành thao tác. Gate LINK chặn mục nền nào không dẫn tới đâu. */
          <section className="mt-5 rounded-card border border-stroke bg-surface p-4">
            <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
              Nền này lộ ra rõ nhất ở
            </p>
            <div className="flex flex-wrap gap-1.5">
              {d.related.map((n) => (
                <Link
                  key={n}
                  href={`/dsvh/${componentSlug(n)}`}
                  className="rounded-md border border-stroke px-2 py-1 text-caption text-ink-2 hover:border-orange hover:text-ink"
                >
                  {n}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </>
    );
  }

  return <ComponentPage entry={found.entry} />;
}

function ComponentPage({ entry }: { entry: ComponentEntry }) {
  const slug = componentSlug(entry.name);
  const aliases = componentAliases(entry).filter((a) => a !== slug);
  /* "Liên quan" (khai tay, hai chiều) ĐỨNG TRƯỚC "cùng nhóm" (suy từ group): cùng nhóm chỉ nói
     chúng được xếp chung ngăn, còn liên quan nói chúng thật sự đi cùng nhau trong việc thật. */
  const related = (entry.related ?? [])
    .map((n) => dsComponents.find((c) => c.name === n))
    .filter((c): c is ComponentEntry => Boolean(c));
  const relatedNames = new Set(related.map((c) => c.name));
  const siblings = dsComponents.filter(
    (c) => c.group === entry.group && c.name !== entry.name && !relatedNames.has(c.name),
  );
  const usedIn = dsRecipes.filter((r) => r.builtFrom.includes(entry.name));
  /* MỤC CON gom theo nhóm chức năng, xếp theo thứ tự nhóm xuất hiện — không theo bảng chữ cái.
     Người đọc trang `Table` hỏi "ô cho cột NGÀY là ô nào", không hỏi "ô nào bắt đầu bằng chữ D". */
  const parentEntry = entry.partOf ? dsComponents.find((c) => c.name === entry.partOf) : undefined;
  const parts = dsComponents.filter((c) => c.partOf === entry.name);
  const partGroups = [...new Set(parts.map((c) => c.partCategory ?? "Khác"))].map((cat) => ({
    cat,
    items: parts.filter((c) => (c.partCategory ?? "Khác") === cat),
  }));

  return (
    <>
      <Head title={entry.name} kind={parentEntry ? `bộ phận của ${parentEntry.name}` : entry.group}>
        <code className="mt-1 block text-caption text-ink-3">import from &quot;{entry.import}&quot;</code>
        {parentEntry ? (
          <p className="mt-1 text-caption text-ink-3">
            Thuộc{" "}
            <Link href={`/dsvh/${componentSlug(parentEntry.name)}`} className="font-medium text-link hover:text-link-hover hover:underline">
              {parentEntry.name}
            </Link>
            {entry.partCategory ? ` · ${entry.partCategory}` : ""}
          </p>
        ) : null}
        <p className="mt-3 max-w-3xl text-body leading-relaxed text-ink-2">{entry.purpose}</p>
        {entry.looksLike?.length ? (
          /* TRA NGƯỢC ngay trên trang mục: người tới đây từ đường link vẫn thấy được "cụm nào trên
             màn thì là cái này" — nếu chỉ để ở bảng tra ngược thì ai vào thẳng trang sẽ không biết. */
          <p className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-caption text-ink-3">Nhận ra khi thấy:</span>
            {entry.looksLike.map((k) => (
              <span key={k} className="rounded-md bg-stroke-soft px-1.5 py-0.5 text-caption text-ink-2">
                {k}
              </span>
            ))}
          </p>
        ) : null}
      </Head>

      <section className="mb-5 rounded-card border-l-2 border-orange border-y border-r border-y-stroke border-r-stroke bg-surface p-4">
        <p className="text-caption font-semibold uppercase tracking-wide text-ink-3">Khi nào dùng</p>
        <p className="mt-1 text-body leading-relaxed text-ink-2">{entry.when}</p>
      </section>

      {entry.vs?.length ? (
        /* RANH GIỚI đặt NGAY SAU "khi nào dùng" và TRƯỚC demo: người đọc phải gặp câu "có thứ khác
           gần giống, đây là cách phân biệt" TRƯỚC khi nhìn thấy demo đẹp rồi quyết luôn. */
        <section className="mb-5 rounded-card border border-stroke bg-surface">
          <p className="border-b border-stroke-soft px-5 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3">
            Dễ nhầm với
          </p>
          <div className="flex flex-col divide-y divide-stroke-soft">
            {entry.vs.map((v) => {
              const other = dsComponents.find((c) => c.name === v.name);
              return (
                <div key={v.name} className="grid gap-2 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-body font-medium text-ink">Dùng {entry.name} khi</p>
                    <p className="mt-0.5 text-caption text-ink-2">{v.useThisWhen}</p>
                  </div>
                  <div className="border-t border-stroke-soft pt-2 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                    <p className="text-body font-medium text-ink">
                      Dùng{" "}
                      <Link href={`/dsvh/${componentSlug(v.name)}`} className="text-link hover:text-link-hover hover:underline">
                        {v.name}
                      </Link>{" "}
                      khi
                    </p>
                    <p className="mt-0.5 text-caption text-ink-2">
                      {other?.vs?.find((x) => x.name === entry.name)?.useThisWhen ?? "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <DemoSlot name={entry.name} />

      {/* GIẢI PHẪU nằm NGAY TRONG trang của chính component — không tách thành một chuyên đề riêng.
          Cùng một thứ mà đứng hai chỗ thì AI đọc vào không biết chỗ nào là nguồn. */}
      {entry.name === "Table" ? <TableAnatomy /> : null}

      {/* KHÔNG còn lưới thẻ chữ "Bộ phận dựng sẵn" ở đây: tầng 2 của Giải phẫu đã trưng từng ô
          kèm DEMO CHẠY THẬT. Giữ cả hai là hai danh sách cùng nội dung, một cái không có gì để nhìn. */}
      {entry.props?.length ? (
        <section className="mb-5 rounded-card border border-stroke bg-surface">
          <p className="border-b border-stroke-soft px-5 py-2.5 text-caption font-semibold uppercase tracking-wide text-ink-3">
            Props
          </p>
          <div className="overflow-x-auto p-5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stroke-soft">
                  <th className="pb-2 pr-4 text-caption font-semibold uppercase tracking-wide text-ink-3">Prop</th>
                  <th className="pb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Kiểu</th>
                </tr>
              </thead>
              <tbody>
                {entry.props.map((p) => (
                  <tr key={p.name} className="border-b border-stroke-soft last:border-0">
                    <td className="py-2 pr-4 align-top">
                      <code className="text-caption font-medium text-ink">{p.name}</code>
                    </td>
                    <td className="py-2 text-caption text-ink-2">
                      {p.type}
                      {p.note ? <span className="mt-0.5 block text-ink-3">{p.note}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-card border border-stroke bg-surface p-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
          <span className="text-ink-3">Tệp:</span>
          <code className="text-ink-2">src/components/dsvh/{entry.file}</code>
          <span className="text-ink-3">·</span>
          <a href={`/dsvh/${slug}/llms.txt`} className="font-medium text-link hover:text-link-hover hover:underline">
            bản text cho máy đọc
          </a>
          {aliases.length ? (
            <>
              <span className="text-ink-3">·</span>
              <span className="text-ink-3">
                cũng tới được bằng {aliases.map((a) => `/dsvh/${a}`).join(" · ")}
              </span>
            </>
          ) : null}
        </div>
        {usedIn.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stroke-soft pt-3">
            <span className="text-caption text-ink-3">Dùng trong cụm:</span>
            {usedIn.map((r) => (
              <Link
                key={r.id}
                href={`/dsvh/${r.id}`}
                className="rounded-md border border-stroke px-1.5 py-0.5 text-caption text-ink-2 hover:border-orange hover:text-ink"
              >
                {r.title}
              </Link>
            ))}
          </div>
        ) : null}
        {related.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stroke-soft pt-3">
            <span className="text-caption text-ink-3">Đi cùng:</span>
            {related.map((c) => (
              <Link
                key={c.name}
                href={`/dsvh/${componentSlug(c.name)}`}
                className="rounded-md bg-stroke-soft px-1.5 py-0.5 text-caption text-ink-2 hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
        {siblings.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-stroke-soft pt-3">
            <span className="text-caption text-ink-3">Cùng nhóm:</span>
            {siblings.map((c) => (
              <Link
                key={c.name}
                href={`/dsvh/${componentSlug(c.name)}`}
                className="rounded-md bg-stroke-soft px-1.5 py-0.5 text-caption text-ink-2 hover:text-ink"
              >
                {c.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}

/**
 * Một công thức ghép cụm. Thứ tự khối cố ý: THẤY GÌ → chạy ở đâu → ghép từ đâu → các bước → luật
 * riêng. "Luật riêng" xuống cuối vì nó chỉ có nghĩa khi đã hình dung được cụm; đưa lên đầu thì
 * người đọc gặp một loạt điều cấm trước khi biết đang nói về cái gì.
 */
function RecipePage({ recipe: r }: { recipe: Recipe }) {
  return (
    <>
      <Head title={r.title} kind="công thức ghép cụm">
        <p className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-caption text-ink-3">Nhận ra khi thấy:</span>
          {r.looksLike.map((k) => (
            <span key={k} className="rounded-md bg-stroke-soft px-1.5 py-0.5 text-caption text-ink-2">
              {k}
            </span>
          ))}
        </p>
        <p className="mt-1 text-caption text-ink-3">Đang chạy thật ở: {r.seenOn}</p>
      </Head>

      <section className="mb-5 rounded-card border border-stroke bg-surface p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Ghép từ</p>
        {r.builtFrom.length ? (
          <div className="flex flex-wrap gap-1.5">
            {r.builtFrom.map((b) => (
              <Link
                key={b}
                href={`/dsvh/${componentSlug(b)}`}
                className="rounded-md border border-stroke px-2 py-1 text-caption text-ink-2 hover:border-orange hover:text-ink"
              >
                {b}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-caption text-ink-2">
            Ghép THẲNG từ token, không qua component nào — lý do ở mục “Luật riêng” bên dưới.
          </p>
        )}
      </section>

      <section className="mb-5 rounded-card border border-stroke bg-surface p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">Các bước</p>
        <ol className="flex flex-col gap-2">
          {r.steps.map((x, i) => (
            <li key={i} className="flex gap-2.5 text-body text-ink-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-stroke-soft text-meta font-semibold text-ink-2">
                {i + 1}
              </span>
              <span>{x}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-card border-l-2 border-orange border-y border-r border-y-stroke border-r-stroke bg-surface p-4">
        <p className="mb-2 text-caption font-semibold uppercase tracking-wide text-ink-3">
          Luật riêng của cụm — thứ hay bị làm sai nhất khi tự chế lại
        </p>
        <ul className="flex flex-col gap-2">
          {r.rules.map((x, i) => (
            <li key={i} className="flex gap-2 text-body text-ink-2">
              <span className="shrink-0 text-orange">▸</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
