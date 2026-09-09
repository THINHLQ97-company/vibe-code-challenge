import { dsComponents, dsRecipes, type ComponentEntry, type Recipe } from "./manifest";
import { dsDocs, type DocPage } from "./docs-data";

/**
 * ĐỊA CHỈ của từng mục trong DSVH — một nguồn duy nhất cho trang, cho `llms.txt`, cho mọi liên kết.
 *
 * Trước bản này `/dsvh` là MỘT trang dài, mọi thứ tra bằng neo `#c-Button`. Neo có hai chỗ hỏng:
 * muốn đọc một component vẫn phải tải cả trang (≈775KB HTML cho một câu trả lời hai dòng), và AI
 * đọc xong rất dễ vớ nhầm mục nằm kế bên vì trong luồng văn bản chúng dính liền nhau. Tách route
 * thật thì mỗi mục là một tài liệu độc lập, có biên rõ ràng, và địa chỉ đoán được: `/dsvh/Button`.
 *
 * Quy tắc đặt slug — GIỮ NGUYÊN tên component, không đổi sang kiểu gạch-nối:
 *   "Button"                          → /dsvh/Button
 *   "Card / CardHeader"               → /dsvh/Card       (và /dsvh/CardHeader trỏ về cùng chỗ)
 *   "Chart kit (C / gridProps …)"     → /dsvh/Chart-kit
 * Tên viết đúng như trong code là thứ người ta đã cầm sẵn trong tay khi đi tra; bắt họ dịch sang
 * `button` hay `chart-kit` là thêm một bước đoán không cần thiết.
 */

/** Bỏ phần chú thích trong ngoặc, lấy vế đầu, khoảng trắng → gạch nối. */
export function componentSlug(name: string): string {
  return name
    .replace(/\([^)]*\)/g, " ")
    .split("/")[0]
    .trim()
    .replace(/\s+/g, "-");
}

/** Mọi tên gọi được của một mục — để `/dsvh/CardHeader` và `/dsvh/useToast` đều tới đúng nơi. */
export function componentAliases(entry: ComponentEntry): string[] {
  const parts = entry.name
    .replace(/\([^)]*\)/g, " ")
    .split("/")
    .map((x) => x.trim().replace(/\s+/g, "-"))
    .filter(Boolean);
  return [...new Set([componentSlug(entry.name), ...parts])];
}

/**
 * `giai-phau-bang` KHÔNG còn là chuyên đề riêng (12/08).
 *
 * Nó vốn là phần cấu thành BÊN TRONG mục `Table` — cùng một thứ mà đứng hai chỗ thì AI đọc vào
 * không biết chỗ nào là nguồn, và người đọc phải nhớ rằng "cách dựng bảng" nằm ở một trang khác với
 * "component Table". Nay nội dung đó nằm ngay trên `/dsvh/Table`; địa chỉ cũ chuyển hướng sang đó
 * để mọi liên kết đã phát ra ngoài không chết.
 */

/** Trang chuyên đề — slug tiếng Việt không dấu, KHÔNG trùng id của `dsDocs` (vd `token` ↔ `tokens`). */
export const DSVH_SECTIONS = [
  { slug: "nguyen-ly", title: "Nguyên lý hoạt động", blurb: "Từ lúc nhận yêu cầu tới lúc thay đổi lên sản phẩm." },
  { slug: "tra-nguoc", title: "Tra ngược: thấy gì → dùng gì", blurb: "Cửa vào khi bạn mới chỉ biết mình NHÌN THẤY gì." },
  { slug: "cong-thuc", title: "Công thức ghép cụm", blurb: "Cụm chưa có sẵn thì ghép từ đâu — rút từ màn đang chạy." },
  { slug: "luat-nen", title: "Luật nền", blurb: "Những điều không được vi phạm." },
  { slug: "bang-token", title: "Bảng token", blurb: "Màu, cỡ chữ, bo góc — giá trị thật đang chạy." },
  { slug: "ranh-gioi-shadcn", title: "Ranh giới shadcn/ui", blurb: "Cái nào được mượn, cái nào phải dùng bản DSVH." },
  { slug: "phep-kiem", title: "Phép kiểm", blurb: "`ds:check` chặn những gì, và cửa thoát ở đâu." },
  { slug: "so-thieu", title: "Sổ thiếu", blurb: "Thứ giao diện cần mà DSVH chưa có." },
] as const;

export type SectionSlug = (typeof DSVH_SECTIONS)[number]["slug"];

const SECTION_SLUGS = new Set<string>(DSVH_SECTIONS.map((s) => s.slug));

export type Resolved =
  | { kind: "section"; slug: SectionSlug }
  | { kind: "component"; entry: ComponentEntry }
  | { kind: "doc"; page: DocPage }
  | { kind: "recipe"; recipe: Recipe }
  | null;

/**
 * Một slug → một mục. Không phân biệt hoa thường vì gõ tay `/dsvh/button` là chuyện thường; thứ tự
 * dò cố định (chuyên đề → component → tài liệu nền) nên kết quả không phụ thuộc dữ liệu vào trước.
 */
export function resolveDsvhSlug(raw: string): Resolved {
  const s = decodeURIComponent(raw).toLowerCase();
  if (SECTION_SLUGS.has(s)) return { kind: "section", slug: s as SectionSlug };
  const entry = dsComponents.find((c) => componentAliases(c).some((a) => a.toLowerCase() === s));
  if (entry) return { kind: "component", entry };
  const recipe = dsRecipes.find((r) => r.id.toLowerCase() === s);
  if (recipe) return { kind: "recipe", recipe };
  const page = dsDocs.find((d) => d.id.toLowerCase() === s);
  if (page) return { kind: "doc", page };
  return null;
}

/** Mọi địa chỉ con của /dsvh — dùng cho `generateStaticParams` và cho mục lục ở `llms.txt`. */
export function allDsvhSlugs(): string[] {
  return [
    ...DSVH_SECTIONS.map((s) => s.slug),
    ...dsComponents.map((c) => componentSlug(c.name)),
    ...dsRecipes.map((r) => r.id),
    ...dsDocs.map((d) => d.id),
  ];
}
