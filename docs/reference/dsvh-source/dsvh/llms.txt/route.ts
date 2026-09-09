/**
 * `/dsvh/llms.txt` — bản MÁY ĐỌC của design system, sinh từ `manifest.ts`.
 *
 * Vì sao cần, dù đã có trang `/dsvh`: một AI muốn tra MỘT component phải tải cả trang HTML — hàng
 * chục nghìn token cho một câu trả lời hai dòng, và giữa đống thẻ đó rất dễ vớ nhầm mục bên cạnh.
 * Bản text này cùng nguồn dữ liệu, cùng nội dung, nhưng phẳng và có mốc rõ ràng nên đọc rẻ hơn
 * nhiều lần và không thể đọc lệch mục.
 *
 * CÙNG MỘT NGUỒN với trang HTML và với `npm run ds:check` — ba đầu ra, một `manifest.ts`. Sửa
 * manifest là cả ba đổi theo; không có bước "nhớ cập nhật tài liệu".
 *
 * Chỉ chạy ở môi trường dev — đây là công cụ nội bộ.
 */
import { dsComponents, dsGaps, dsGates, dsGroupOrder, dsRecipes, dsRules, shadcnBorrowed } from "@/components/dsvh/manifest"
import { componentSlug } from "@/components/dsvh/slug"
import { tokenGroups } from "@/components/dsvh/tokens-data"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 })

  const L: string[] = []
  const h = (s: string) => L.push("", `## ${s}`, "")

  L.push("# DSVH — design system của vays-panel")
  L.push("")
  L.push("Sinh từ `src/components/dsvh/manifest.ts` — cùng nguồn với trang /dsvh và với gate")
  L.push("`npm run ds:check`. Component KHÔNG có trong manifest = không tồn tại.")
  L.push("")
  L.push("ĐỌC MỘT MỤC THÌ ĐỪNG TẢI FILE NÀY. Mỗi mục có địa chỉ riêng, rẻ hơn khoảng 100 lần và")
  L.push("không lẫn sang mục khác:")
  L.push("  /dsvh/Button/llms.txt          — một component (tên viết đúng như trong code)")
  L.push("  /dsvh/typography/llms.txt      — một mục tài liệu nền")
  L.push("  /dsvh/luat-nen/llms.txt        — một chuyên đề")
  L.push("Bỏ `/llms.txt` đi thì ra bản HTML có demo chạy thật của cùng mục đó.")

  h("QUY TRÌNH DỰNG MỘT MÀN — LÀM THEO ĐÚNG THỨ TỰ NÀY")
  L.push("1. Đọc CẢ MÀN trước. Ghi ra từng CỤM theo ý định (khối này để làm gì), không theo pixel.")
  L.push("2. Tra NGƯỢC từng cụm ở mục kế tiếp — gõ thứ NHÌN THẤY, không phải tên component.")
  L.push("3. Ra HAI đáp án → đọc mục 'dễ nhầm với' của mục đó (khai hai chiều).")
  L.push("4. KHÔNG ra đáp án → xem mục CÔNG THỨC GHÉP CỤM: phần lớn thứ trên màn là cụm ghép,")
  L.push("   không phải một component đơn lẻ.")
  L.push("5. Vẫn không có → ghi vào SỔ THIẾU rồi mới dựng. Dựng mới = viết component + khai manifest")
  L.push("   + thêm demo, ba việc chứ không phải một.")
  L.push("6. Ghép bằng token, rồi `npm run ds:check`. Không đạt thì quay lại bước 4.")
  L.push("")
  L.push("Bỏ bước 1–2 là nguồn gốc của gần hết những lần một màn mới trông khác các màn cũ.")

  h("TRA NGƯỢC — THẤY GÌ THÌ DÙNG GÌ")
  L.push("Đọc mục này TRƯỚC khi dựng: tách màn thành từng cụm, rồi tra cụm đó ở đây. Mỗi từ khoá")
  L.push("chỉ thuộc đúng một mục (gate RECOGNISE ép), nên không có chuyện hai đáp án cho một cụm.")
  L.push("Không tìm thấy cụm của bạn ở đây = DSVH chưa có → xem mục CÔNG THỨC GHÉP CỤM bên dưới.")
  L.push("")
  const map = [
    ...dsComponents.flatMap((c) =>
      (c.looksLike ?? []).map((k) => ({ k, to: c.name, url: `/dsvh/${componentSlug(c.name)}`, kind: "component" })),
    ),
    ...dsRecipes.flatMap((r) =>
      r.looksLike.map((k) => ({ k, to: r.title, url: `/dsvh/${r.id}`, kind: "công thức ghép cụm" })),
    ),
  ].sort((a, b) => a.k.localeCompare(b.k, "vi"))
  for (const m of map) L.push(`- ${m.k} → ${m.to} [${m.kind}]  (${m.url})`)

  h("LUẬT NỀN")
  dsRules.forEach((r, i) => L.push(`${i + 1}. ${r}`))

  h("PHÉP KIỂM SẼ CHẶN BẠN")
  L.push("`npm run ds:check` chạy ở pre-commit. Viết code trước khi đọc mục này thì phần lớn thời gian")
  L.push("sẽ mất vào việc sửa lại cho qua gate. Mỗi gate đều có cửa thoát ghi tại chỗ (`ds-allow-*`).")
  L.push("")
  for (const g of dsGates) L.push(`- ${g.id} — chặn: ${g.blocks}`)

  h("TOKEN")
  L.push("Chỉ dùng token, KHÔNG hardcode hex. Gate TOKEN chặn, cửa thoát `ds-allow-hex: <lý do>`.")
  for (const g of tokenGroups) {
    L.push("", `### ${g.label}`)
    for (const t of g.tokens)
      L.push(`- \`${t.utility}\` — ${t.name} · sáng ${t.light}${t.dark ? ` · tối ${t.dark}` : " · không đổi theo theme"}`)
  }

  h("COMPONENT")
  L.push("Mỗi mục: TÊN · import · làm gì · dùng khi nào · props.")
  const groups = [...new Set([...dsGroupOrder, ...dsComponents.map((c) => c.group)])]
  for (const g of groups) {
    const items = dsComponents.filter((c) => c.group === g)
    if (!items.length) continue
    L.push("", `### ${g}`)
    for (const c of items) {
      L.push("", `#### ${c.name}`)
      L.push(`trang riêng: /dsvh/${componentSlug(c.name)} · /dsvh/${componentSlug(c.name)}/llms.txt`)
      L.push(`import: ${c.import}`)
      L.push(`làm gì: ${c.purpose}`)
      L.push(`dùng khi: ${c.when}`)
      if (c.looksLike?.length) L.push(`nhận ra khi thấy: ${c.looksLike.join(" · ")}`)
      for (const v of c.vs ?? []) L.push(`dễ nhầm với ${v.name} — dùng ${c.name} khi: ${v.useThisWhen}`)
      if (c.props?.length) {
        L.push("props:")
        for (const p of c.props) L.push(`  - ${p.name}: ${p.type}${p.note ? ` (${p.note})` : ""}`)
      }
    }
  }

  h("CÔNG THỨC GHÉP CỤM — cụm chưa có sẵn thì ghép từ đâu")
  L.push("Tầng giữa TOKEN và COMPONENT. Phần lớn thứ trên một màn thật là CỤM ghép từ nhiều")
  L.push("component. Mỗi công thức rút từ màn ĐANG CHẠY THẬT, đọc đầy đủ ở /dsvh/<id>/llms.txt.")
  for (const r of dsRecipes) {
    L.push("", `### ${r.title}  (/dsvh/${r.id})`)
    L.push(`nhận ra khi thấy: ${r.looksLike.join(" · ")}`)
    L.push(`đang chạy thật ở: ${r.seenOn}`)
    L.push(`ghép từ: ${r.builtFrom.length ? r.builtFrom.join(", ") : "token trần"}`)
  }

  h("RANH GIỚI SHADCN")
  L.push(`Mượn lâu dài (DSVH không có bản tương đương): ${shadcnBorrowed.allowed.join(", ")}`)
  L.push("TRÙNG với DSVH — code mới PHẢI dùng bản DSVH:")
  for (const [k, v] of Object.entries(shadcnBorrowed.duplicated)) L.push(`  - ui/${k} → ${v}`)

  h("SỔ THIẾU (việc còn dở)")
  for (const g of dsGaps.filter((x) => x.status === "open")) L.push(`- ${g.need} — ${g.context}`)

  return new Response(L.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  })
}
