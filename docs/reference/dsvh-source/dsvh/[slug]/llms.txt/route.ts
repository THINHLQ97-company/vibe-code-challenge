import { dsComponents, dsGaps, dsGates, dsRecipes, dsRules, shadcnBorrowed } from "@/components/dsvh/manifest"
import { componentAliases, componentSlug, resolveDsvhSlug } from "@/components/dsvh/slug"
import { tokenGroups } from "@/components/dsvh/tokens-data"
import type { DocBlock } from "@/components/dsvh/docs-data"

/**
 * `/dsvh/<mục>/llms.txt` — bản máy đọc của MỘT mục.
 *
 * `/dsvh/llms.txt` (toàn bộ) đã rẻ hơn trang HTML khoảng 13 lần, nhưng vẫn là ~57KB cho một câu hỏi
 * kiểu "Button có variant gì". Bản một-mục còn rẻ hơn hai bậc nữa, và quan trọng hơn: nó KHÔNG chứa
 * mục nào khác, nên không có gì để đọc lẫn sang. Đây là điểm khác biệt thật giữa neo và route —
 * cùng một nội dung, nhưng một bên có biên còn một bên thì không.
 *
 * Chỉ chạy ở môi trường dev — công cụ nội bộ.
 */
export const dynamic = "force-dynamic"

/** Trải một khối tài liệu về text phẳng — giữ nghĩa, bỏ trình bày. */
function flatten(b: DocBlock): string[] {
  switch (b.type) {
    case "h":
      return ["", `### ${b.text}`]
    case "p":
      return [b.text]
    case "ul":
      return b.items.map((i) => `- ${i}`)
    case "note":
      return [`LƯU Ý: ${b.text}`]
    case "code":
      return ["```", b.code, "```"]
    case "table":
      return [b.head.join(" | "), ...b.rows.map((r) => r.join(" | "))]
    case "demo":
      return [`(minh hoạ trực quan "${b.key}" — xem bản HTML)`]
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 })

  const found = resolveDsvhSlug((await params).slug)
  if (!found) return new Response("Not found", { status: 404 })

  const L: string[] = []

  if (found.kind === "component") {
    const c = found.entry
    const alias = componentAliases(c).filter((a) => a !== componentSlug(c.name))
    L.push(`# ${c.name} — DSVH`, "")
    L.push(`import: ${c.import}`)
    L.push(`tệp: src/components/dsvh/${c.file}`)
    L.push(`nhóm: ${c.group}`)
    if (alias.length) L.push(`tên gọi khác: ${alias.join(", ")}`)
    if (c.looksLike?.length) L.push(`nhận ra khi thấy: ${c.looksLike.join(" · ")}`)
    L.push("", "## LÀM GÌ", c.purpose)
    L.push("", "## DÙNG KHI NÀO", c.when)
    if (c.props?.length) {
      L.push("", "## PROPS")
      for (const p of c.props) L.push(`- ${p.name}: ${p.type}${p.note ? ` (${p.note})` : ""}`)
      L.push("", "Prop nào có ở đây thì CÓ THẬT trong code — gate PROPS đối chiếu lại mỗi lần commit.")
    } else {
      L.push("", "## PROPS", "(chưa khai trong manifest — đọc thẳng tệp nguồn ở trên)")
    }
    if (c.vs?.length) {
      L.push("", "## DỄ NHẦM VỚI — chọn cái nào")
      for (const v of c.vs) {
        const other = dsComponents.find((x) => x.name === v.name)
        L.push(`- ${v.name}`)
        L.push(`    dùng ${c.name} khi: ${v.useThisWhen}`)
        const back = other?.vs?.find((x) => x.name === c.name)?.useThisWhen
        if (back) L.push(`    dùng ${v.name} khi: ${back}`)
        L.push(`    chi tiết: /dsvh/${componentSlug(v.name)}/llms.txt`)
      }
    }

    if (c.related?.length) L.push("", "## ĐI CÙNG", ...c.related.map((n) => `- ${n}: /dsvh/${componentSlug(n)}/llms.txt`))
    const used = dsRecipes.filter((r) => r.builtFrom.includes(c.name))
    if (used.length) L.push("", "## DÙNG TRONG CỤM", ...used.map((r) => `- ${r.title}: /dsvh/${r.id}/llms.txt`))

    L.push("", "## LUẬT ÁP DỤNG CHO MỌI COMPONENT")
    dsRules.forEach((r, i) => L.push(`${i + 1}. ${r}`))
    L.push("", "Toàn bộ design system: /dsvh/llms.txt")
  } else if (found.kind === "recipe") {
    const r = found.recipe
    L.push(`# ${r.title} — công thức ghép cụm (DSVH)`, "")
    L.push(`nhận ra khi thấy: ${r.looksLike.join(" · ")}`)
    L.push(`đang chạy thật ở: ${r.seenOn}`)
    L.push(
      r.builtFrom.length
        ? `ghép từ: ${r.builtFrom.join(", ")}`
        : "ghép THẲNG từ token (không qua component nào) — lý do ở mục LUẬT RIÊNG bên dưới",
    )
    L.push("", "## CÁC BƯỚC")
    r.steps.forEach((x, i) => L.push(`${i + 1}. ${x}`))
    L.push("", "## LUẬT RIÊNG CỦA CỤM — thứ hay bị làm sai nhất khi tự chế lại")
    for (const x of r.rules) L.push(`- ${x}`)
    if (r.builtFrom.length) {
      L.push("", "## CHI TIẾT TỪNG THÀNH PHẦN")
      for (const b of r.builtFrom) L.push(`- ${b}: /dsvh/${componentSlug(b)}/llms.txt`)
    }
    L.push("", "Toàn bộ design system: /dsvh/llms.txt")
  } else if (found.kind === "doc") {
    const d = found.page
    L.push(`# ${d.title} — DSVH`, "", `nhóm: ${d.group}`, "")
    for (const b of d.blocks) L.push(...flatten(b))
    if (d.related?.length)
      L.push("", "## NỀN NÀY LỘ RA RÕ NHẤT Ở", ...d.related.map((n) => `- ${n}: /dsvh/${componentSlug(n)}/llms.txt`))
    L.push("", "Toàn bộ design system: /dsvh/llms.txt")
  } else {
    switch (found.slug) {
      case "luat-nen":
        L.push("# Luật nền — DSVH", "")
        dsRules.forEach((r, i) => L.push(`${i + 1}. ${r}`))
        break
      case "bang-token":
        L.push("# Token — DSVH", "", "Chỉ dùng token, KHÔNG hardcode hex. Gate TOKEN chặn, cửa thoát `ds-allow-hex: <lý do>`.")
        for (const g of tokenGroups) {
          L.push("", `## ${g.label}`)
          for (const t of g.tokens)
            L.push(`- \`${t.utility}\` — ${t.name} · sáng ${t.light}${t.dark ? ` · tối ${t.dark}` : " · không đổi theo theme"}`)
        }
        break
      case "ranh-gioi-shadcn":
        L.push("# Ranh giới shadcn/ui — DSVH", "")
        L.push(`Mượn lâu dài (DSVH không có bản tương đương): ${shadcnBorrowed.allowed.join(", ")}`)
        L.push("", "TRÙNG với DSVH — code mới PHẢI dùng bản DSVH:")
        for (const [k, v] of Object.entries(shadcnBorrowed.duplicated)) L.push(`- ui/${k} → ${v}`)
        break
      case "phep-kiem":
        L.push("# Phép kiểm — DSVH", "", "`npm run ds:check` chạy ở pre-commit. Cửa thoát ghi tại chỗ: `ds-allow-*: lý do`.", "")
        for (const g of dsGates) L.push(`- ${g.id} — chặn: ${g.blocks}`)
        break
      case "so-thieu":
        L.push("# Sổ thiếu — DSVH", "", "Thứ giao diện cần mà DSVH chưa có. Ghi vào đây thay vì dựng lén trong module.", "")
        for (const g of dsGaps) L.push(`- [${g.status}] ${g.need} — ${g.context}`)
        break
      default:
        /* `nguyen-ly` và `giai-phau-bang` là sơ đồ và bảng mẫu — trải thành text thì mất đúng thứ
           làm nên giá trị của chúng. Trỏ về bản HTML thay vì trả một bản rút gọn gây hiểu nhầm. */
        L.push(`# ${found.slug} — DSVH`, "", `Mục này là nội dung TRỰC QUAN, xem bản HTML: /dsvh/${found.slug}`)
    }
    L.push("", "Toàn bộ design system: /dsvh/llms.txt")
  }

  return new Response(L.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  })
}
