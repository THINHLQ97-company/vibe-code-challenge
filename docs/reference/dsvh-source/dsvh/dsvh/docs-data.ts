/**
 * TÀI LIỆU NỀN của DSVH — 22 mục chuyển nguyên văn từ trang `/dsvh` cũ (vibe-host-ui), ngày 05/08/2026.
 *
 * Văn xuôi giữ NGUYÊN của tác giả; phần JSX chèn giữa bài được chuyển thành block: `<Preview>` →
 * block `code` (giữ đúng đoạn mẫu), component minh hoạ sống → block `demo` có khoá (xem
 * `docsDemos` trong `demos.tsx`). Chỗ nào chưa dựng được demo thì gallery hiện nhãn rõ ràng —
 * không im lặng bỏ mất nội dung.
 *
 * Không bê nguyên MDX sang vì vays-panel là app production: kéo mdx/shiki/rehype/remark vào bundle
 * chỉ để hiển thị tài liệu là cái giá không đáng trả.
 */

export type DocBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string }
  | { type: "code"; lang: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "demo"; key: string };

export type DocPage = {
  id: string;
  /** cùng hệ 13 nhóm với ComponentEntry.group */
  group: string;
  title: string;
  /** đường dẫn trang tương ứng ở hệ cũ — để đối chiếu khi cần */
  origin: string;
  /**
   * COMPONENT mà nền này lộ ra rõ nhất — để tài liệu nền không phải ngõ cụt.
   *
   * Đo ngày 11/08: 9/23 mục nền không nhắc tới một component nào. Đọc xong "Khoảng cách" hay "Bo
   * góc" mà không biết áp vào đâu thì nó chỉ là kiến thức, không thành thao tác được.
   */
  related?: string[];
  blocks: DocBlock[];
};

export const dsDocs: DocPage[] = [
  {
    "id": "ba-tang-kiem",
    "group": "Guidelines",
    "title": "Ba tầng kiểm — làm đúng khi không nhìn thấy giao diện",
    "origin": "ba-tang-kiem",
    "blocks": [
      {
        "type": "p",
        "text": "Chốt 20/08/2026 theo yêu cầu chủ dự án. Trong tuần 14–20/08, chủ dự án phát hiện 9 lớp lỗi giao diện bằng cách mở trang và chụp màn hình; gần như lớp nào cũng đã CÓ luật hoặc CÓ component sẵn trong DSVH. Vấn đề không phải thiếu tài liệu — mà là thiếu một thứ tự làm việc bắt buộc."
      },
      {
        "type": "h",
        "text": "Tầng 1 — TRA trước khi gõ dòng đầu tiên"
      },
      {
        "type": "p",
        "text": "`npm run ds:find \"<thứ bạn đang nhìn thấy>\"`. Gõ bằng từ NGƯỜI DÙNG, không phải tên component — lúc đi tra thì bạn chưa biết tên, đó chính là lý do bạn tra. Bỏ bước này là nguồn của bốn lỗi trong tuần: dựng lại biểu đồ đã có ở /dsvh, tô cam cho liên kết trong khi hệ có token `link` từ 13/08, vẽ chữ viết tắt cho avatar trong khi luật đã chốt logo từ 06/08, và tự dựng ô nhãn/giá trị ở 26 chỗ trong khi lẽ ra chỉ cần một component."
      },
      {
        "type": "h",
        "text": "Tầng 2 — ĐO bằng máy, không bằng mắt"
      },
      {
        "type": "p",
        "text": "`npm run ds:probe` — chạy trên trình duyệt thật qua 26 màn. Đo bốn thứ mà phân tích tĩnh KHÔNG thấy được: khe dọc 0px giữa các khối trong thẻ; cỡ chữ ngoài thang 8 bậc (kể cả cỡ đến từ thư viện ngoài); tương phản WCAG (phải rasterise ra pixel vì Tailwind v4 trả `oklab`); và LẶP NỘI DUNG — cùng một chuỗi in ra từ hai cấu trúc khác nhau trong CÙNG một thẻ."
      },
      {
        "type": "p",
        "text": "Phép LẶP thêm 20/08 sau khi chủ dự án gọi /admin/plans và /admin/nodes là \"hỗn loạn\": mỗi thẻ gói in cùng bốn con số hai lần cách nhau 8px, và thẻ node nói \"Chưa có số đo\" hai lần mỗi thẻ. Hai nhánh code đọc riêng thì hoàn toàn hợp lý — chỉ khi CHẠY mới thấy chúng in ra cùng một thứ. Nó ở mức GỢI Ý chứ không chặn: nó còn báo oan các danh sách có hàng giống nhau, và một phép kiểm nửa đúng mà chặn cứng thì người ta tắt nó đi cho xong việc."
      },
      {
        "type": "h",
        "text": "Tầng 3 — Luật nào cũng phải có GATE, và gate phải được THỬ"
      },
      {
        "type": "p",
        "text": "Luật không có gate thì bằng không. Đo được trong tuần: luật 14 (ba vai chữ trong bảng) nằm im 11 ngày; luật 11 trỏ vào một component đã bị gộp đi 8 ngày trước; token `link` 6 ngày; luật avatar 14 ngày; `PageShell` bị chép tay ở 7 tệp trong khi tài liệu của chính nó cảnh báo điều đó."
      },
      {
        "type": "p",
        "text": "Và gate mới viết ra PHẢI được thử bằng cách GIEO LẠI vi phạm rồi xem nó có đỏ không. Bốn trong sáu gate thêm tuần này lần đầu viết ra là gate RỖNG: THEADCASE đòi `uppercase` và `<thead>` cùng một dòng; NOWRAP soi cả tệp nên tệp nhiều component không bao giờ đỏ nổi, rồi soi riêng thân hàm thì báo oan component khai class trong `tv()`, và lượt cuối lộ ra chính COMMENT giải thích luật có chứa chuỗi cần tìm nên gate luôn xanh."
      },
      {
        "type": "h",
        "text": "Giới hạn — nói ra để không ai tin nhầm"
      },
      {
        "type": "p",
        "text": "Ba tầng này bắt được SAI LUẬT và TRÙNG LẶP. Chúng KHÔNG bắt được thẩm mỹ: cân đối, thứ bậc thị giác, chữ dùng có tự nhiên không. Đó vẫn là việc của mắt người. Quy trình này để người xem giao diện không phải làm nốt phần máy làm được."
      }
    ]
  },
  {
    "id": "a11y",
    "group": "Guidelines",
    "title": "Khả năng tiếp cận (a11y)",
    "origin": "a11y",
    "blocks": [
      {
        "type": "p",
        "text": "DSVH đặt a11y làm mặc định, không phải tuỳ chọn."
      },
      {
        "type": "h",
        "text": "Checklist"
      },
      {
        "type": "ul",
        "items": [
          "**Icon-only button** phải có `aria-label` (vd nút chuông, kebab, collapse).",
          "**Focus visible**: dùng `focus-visible:ring-2 focus-visible:ring-orange/30` cho control tương tác (Button đã có sẵn).",
          "**Landmark**: `<nav aria-label>`, `<main>`, `<header>`, `<aside>` đúng ngữ nghĩa.",
          "**aria-current=\"page\"** cho item nav đang chọn (Sidebar/DocsSidebar đã có).",
          "**Trạng thái**: `aria-invalid` cho Input lỗi; `role=\"progressbar\"` + `aria-valuenow` cho Progress; `aria-expanded` cho dropdown.",
          "**Bàn phím**: menu đóng bằng `Esc`; `⌘K` mở search; Enter gửi ở PromptInput.",
          "**Tương phản**: text chính `ink` trên `surface` đạt ≥ AA; text phụ dùng `ink-2` (không dùng `ink-3` cho nội dung quan trọng).",
          "**Reduced motion**: mọi animation tự tắt qua `prefers-reduced-motion` (đã cài trong globals.css)."
        ]
      },
      {
        "type": "h",
        "text": "Màu không phải là kênh duy nhất"
      },
      {
        "type": "p",
        "text": "Delta tăng/giảm ngoài màu (teal/orange) nên kèm dấu `+`/`-` hoặc icon để người mù màu vẫn phân biệt."
      },
      {
        "type": "demo",
        "key": "A11yDemo"
      }
    ]
  },
  {
    "id": "app-shell",
    "group": "Layout",
    "title": "App Shell",
    "origin": "app-shell",
    "related": ["PageShell", "PageHeader", "TabsNav"],
    "blocks": [
      {
        "type": "p",
        "text": "Khung ứng dụng: `<Sidebar/>` (tối) + panel nội dung trắng bo góc trên nền `canvas`. Dùng chung cho mọi trang app để đồng bộ."
      },
      {
        "type": "demo",
        "key": "AppShellDemo"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { Shell } from \"@/components/Shell\";\n\n<Shell>\n  {/* page content */}\n</Shell>"
      },
      {
        "type": "h",
        "text": "Cấu tạo"
      },
      {
        "type": "ul",
        "items": [
          "**Ngoài cùng**: `flex min-h-screen bg-canvas` (canvas = navy tối).",
          "**Sidebar**: `sticky top-0 h-screen`, dark, collapse được (icon-rail).",
          "**Main panel**: `flex-1 p-2 sm:p-3` bọc `rounded-3xl border border-stroke bg-surface` — panel trắng \"nổi\" trên canvas."
        ]
      },
      {
        "type": "h",
        "text": "Biến thể 3 cột (assistant)"
      },
      {
        "type": "p",
        "text": "Thêm một panel phụ bên trong panel chính (xem [AI Assistant](/dsvh/patterns/assistant)): `<Sidebar defaultCollapsed/>` + `[CoPilotPanel | Main]`."
      },
      {
        "type": "h",
        "text": "Mobile"
      },
      {
        "type": "p",
        "text": "Sidebar thành drawer (hamburger ở topbar mở), backdrop mờ, `Esc` để đóng, khoá scroll nền."
      }
    ]
  },
  {
    "id": "charts",
    "group": "Data Display",
    "title": "Biểu đồ",
    "origin": "charts",
    "blocks": [
      {
        "type": "p",
        "text": "Biểu đồ dùng **Recharts** + bộ helper `@/components/charts/kit` để đồng bộ màu, lưới, tooltip. Xem chart chạy thật ở [Dashboard](/) (Analytics)."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { C, gridProps, cursorLine, axisTick, TooltipCard } from \"@/components/charts/kit\";"
      },
      {
        "type": "h",
        "text": "Palette (`C`)"
      },
      {
        "type": "p",
        "text": "Series lấy từ hằng `C` — ánh xạ semantic token:"
      },
      {
        "type": "ul",
        "items": [
          "`C.orangeBright` · `C.orange` — cam (series chính, cost)",
          "`C.teal` · `C.mint` — xanh (success, volume)",
          "`C.peach` · `C.magenta` — series phụ",
          "`C.grid` (lưới) · `C.tick` (nhãn trục) · `C.ink` (chữ)"
        ]
      },
      {
        "type": "h",
        "text": "Convention"
      },
      {
        "type": "ul",
        "items": [
          "Line/Area: `type=\"monotone\"`, `strokeWidth={2.4}`, `activeDot` bo trắng.",
          "Grid: `<CartesianGrid {...gridProps} />` (chỉ kẻ ngang, màu nhạt).",
          "Trục: `tick={axisTick}`, `tickLine={false}`, `axisLine={false}`.",
          "Tooltip: `content` render `<TooltipCard title rows />`, `cursor={cursorLine}`.",
          "Bar: bo góc `radius={[4,4,0,0]}`, `maxBarSize` nhỏ (~9).",
          "Animation vẽ: `animationDuration` 800–1100ms, stagger `animationBegin`."
        ]
      },
      {
        "type": "h",
        "text": "Ví dụ (Area)"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<ResponsiveContainer width=\"100%\" height=\"100%\">\n  <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>\n    <defs>\n      <linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\n        <stop offset=\"0%\" stopColor={C.orangeBright} stopOpacity={0.24} />\n        <stop offset=\"100%\" stopColor={C.orangeBright} stopOpacity={0} />\n      </linearGradient>\n    </defs>\n    <CartesianGrid {...gridProps} />\n    <XAxis dataKey=\"t\" tick={axisTick} tickLine={false} axisLine={false} />\n    <YAxis tick={axisTick} tickLine={false} axisLine={false} width={34} />\n    <Tooltip content={<MyTooltip />} cursor={cursorLine} />\n    <Area type=\"monotone\" dataKey=\"v\" stroke={C.orangeBright}\n      strokeWidth={2.4} fill=\"url(#g)\" animationDuration={1100} />\n  </AreaChart>\n</ResponsiveContainer>"
      },
      {
        "type": "h",
        "text": "Chart types dùng trong app"
      },
      {
        "type": "ul",
        "items": [
          "**Area** — User Growth, Intelligence Flow.",
          "**Line** — System Vitality (2 series + marker).",
          "**Grouped Bar** — Usage Efficiency (highlight cột hover).",
          "**Ribbon** (bespoke SVG) — Intelligence Efficiency."
        ]
      },
      {
        "type": "note",
        "text": "Luôn bọc trong `<Card>` + `CardHeader` + legend (`LegendDot`). Chiều cao cố định bằng div `h-[190px]` để `ResponsiveContainer` tính đúng."
      },
      {
        "type": "demo",
        "key": "ChartsDemo"
      }
    ]
  },
  {
    "id": "colors",
    "group": "Foundations",
    "title": "Màu",
    "origin": "colors",
    "related": ["Badge", "Alert", "StatusDot"],
    "blocks": [
      {
        "type": "p",
        "text": "DSVH dùng **semantic color token** — bạn gọi theo *vai trò* (`ink`, `surface`, `orange`…), không phải theo mã hex. Mỗi token sinh ra utility Tailwind: `text-*`, `bg-*`, `border-*`."
      },
      {
        "type": "note",
        "text": "Quy tắc vàng: **không hardcode hex** trong component. Đổi 1 giá trị ở lớp primitive (`globals.css`) là lan toả toàn hệ thống."
      },
      {
        "type": "h",
        "text": "Palette"
      },
      {
        "type": "p",
        "text": "Bảng tra đầy đủ 28 màu — có ô màu chia đôi sáng/tối, tên utility và giá trị hex — nằm ở [Bảng token](/dsvh/bang-token). Mục này chỉ nói **dùng màu nào cho vai trò gì**; bảng giá trị cố ý KHÔNG lặp lại ở đây để chỉ có một chỗ duy nhất trả lời câu hỏi \"màu nào?\"."
      },
      {
        "type": "h",
        "text": "Usage"
      },
      {
        "type": "p",
        "text": "Dùng token đúng vai trò — ví dụ một card với nền trắng, viền, chữ chính và accent:"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"rounded-card border border-stroke bg-surface p-4\">\n  <p className=\"text-ink font-semibold\">Bot Replies</p>\n  <p className=\"text-ink-2 text-sm\">+12% higher volume</p>\n  <button className=\"mt-3 rounded-lg bg-orange px-3 py-1.5 text-white text-sm\">\n    View\n  </button>\n</div>"
      },
      {
        "type": "h",
        "text": "Liên kết"
      },
      {
        "type": "p",
        "text": "Mọi thẻ `<a>` dẫn tới một địa chỉ — website khách vừa dựng, tài liệu ngoài, kho mã — dùng `text-link` (xanh dương), rê chuột đổi sang `text-link-hover`. **Không dùng `text-orange` cho liên kết**: cam là màu thương hiệu, dành cho hành động chính; cam hoá mọi thứ bấm được thì người dùng hết phân biệt được đâu là nút, đâu là đường dẫn."
      },
      {
        "type": "note",
        "text": "Xanh dương ĐẢO giá trị giữa hai theme, khác các accent khác. `#0b6bcb` ở nền sáng đo được 5.28:1; chính nó trên nền tối chỉ còn 2.19:1 nên theme tối đổi sang `#6bb6ff` (7.97:1). Màu xanh mặc định của trình duyệt (`#0072F5`) chỉ đạt 4.44:1 — **trượt** ngưỡng AA cho chữ 14px, đó là lý do hệ phải có token riêng thay vì để thẻ `<a>` không tô màu."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<a href={liveUrl} target=\"_blank\" rel=\"noopener noreferrer\"\n   className=\"text-link hover:text-link-hover hover:underline\">\n  {liveUrl}\n</a>"
      },
      {
        "type": "h",
        "text": "Trend colors"
      },
      {
        "type": "p",
        "text": "Quy ước cho số liệu tăng/giảm:"
      },
      {
        "type": "ul",
        "items": [
          "**Tăng (dương)** → `text-teal`",
          "**Giảm (âm)** → `text-orange`"
        ]
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<span className=\"text-teal\">+15% user growth</span>\n<span className=\"text-orange\">-5% fewer sessions</span>"
      },
      {
        "type": "h",
        "text": "For AI / machine"
      },
      {
        "type": "p",
        "text": "Toàn bộ token + component + recipe có bản máy đọc: [`/dsvh.json`](/dsvh.json) và bản text cho LLM: [`/llms.txt`](/llms.txt)."
      }
    ]
  },
  {
    "id": "do-dont",
    "group": "Guidelines",
    "title": "Nên / Không nên",
    "origin": "do-dont",
    "blocks": [
      {
        "type": "p",
        "text": "Những lỗi hay gặp khi dựng UI trong hệ này (đặc biệt khi vibe-code với AI)."
      },
      {
        "type": "h",
        "text": "Màu & token"
      },
      {
        "type": "ul",
        "items": [
          "✅ Dùng semantic token: `text-ink`, `bg-surface`, `border-stroke`, `text-orange`.",
          "❌ Hardcode hex (`text-ink`) hoặc màu Tailwind lạ (`bg-slate-800`, `text-gray-500`).",
          "❌ Dùng `bg-canvas` cho nội dung sáng — `canvas` là **navy tối**, chỉ cho rail/shell."
        ]
      },
      {
        "type": "h",
        "text": "Component"
      },
      {
        "type": "ul",
        "items": [
          "✅ Tái sử dụng: `Card`, `Sidebar`, `Table`, `FileUpload`, `Button`, `Input`…",
          "❌ Dựng lại sidebar/thanh menu thứ 2 — dùng chung **một** `<Sidebar/>`.",
          "❌ Tự vẽ SVG icon inline — import từ `@/components/icons` (Phosphor)."
        ]
      },
      {
        "type": "h",
        "text": "Layout & spacing"
      },
      {
        "type": "ul",
        "items": [
          "✅ Theo thang spacing (bội số 4) và radius scale.",
          "❌ Số lẻ tuỳ tiện (`p-[13px]`, `rounded-[9px]`).",
          "✅ Card cùng hàng đặt `h-full` để bằng chiều cao."
        ]
      },
      {
        "type": "h",
        "text": "Trạng thái"
      },
      {
        "type": "ul",
        "items": [
          "✅ Xử lý đủ loading / empty / error (xem [States](/dsvh/patterns/states)).",
          "❌ Chỉ làm \"happy path\"."
        ]
      },
      {
        "type": "h",
        "text": "AI / vibe-code"
      },
      {
        "type": "ul",
        "items": [
          "✅ Đọc [`/llms.txt`](/llms.txt) + [`/dsvh.json`](/dsvh.json) trước khi sinh UI.",
          "✅ Map mockup/BA/wireframe → recipe trong manifest.",
          "❌ \"Chế\" component/màu mới khi đã có sẵn trong DSVH."
        ]
      },
      {
        "type": "demo",
        "key": "DoDontDemo"
      }
    ]
  },
  {
    "id": "grid",
    "group": "Layout",
    "title": "Lưới & Container",
    "origin": "grid",
    "blocks": [
      {
        "type": "p",
        "text": "Bố cục lưới & khung chứa theo Tailwind, có nhịp chuẩn DSVH."
      },
      {
        "type": "h",
        "text": "Container"
      },
      {
        "type": "p",
        "text": "Nội dung docs/panel giới hạn bề rộng để dễ đọc:"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"mx-auto w-full max-w-[1400px] px-4 lg:px-6\">…</div>"
      },
      {
        "type": "h",
        "text": "Grid dashboard"
      },
      {
        "type": "p",
        "text": "12 cột trên desktop, gộp dần:"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-12\">\n  <div className=\"md:col-span-2 xl:col-span-7\">…</div>\n  <div className=\"md:col-span-2 xl:col-span-5\">…</div>\n</div>"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"grid grid-cols-3 gap-3\">\n  <div className=\"col-span-2 rounded-lg bg-stroke-soft p-4\">col-span-2</div>\n  <div className=\"rounded-lg bg-stroke-soft p-4\">1</div>\n</div>"
      },
      {
        "type": "h",
        "text": "Nhịp"
      },
      {
        "type": "ul",
        "items": [
          "Gap card: `gap-4` → `lg:gap-5`.",
          "Card cùng hàng: `h-full` để bằng chiều cao.",
          "Padding panel: `p-2 sm:p-3`; padding card: `p-4 sm:p-5`."
        ]
      },
      {
        "type": "demo",
        "key": "GridDemo"
      }
    ]
  },
  {
    "id": "icons",
    "group": "Foundations",
    "title": "Icon",
    "origin": "icons",
    "related": ["Button", "TableActionsCell"],
    "blocks": [
      {
        "type": "p",
        "text": "Icon dùng bộ **Phosphor** (`@phosphor-icons/react`), bọc trong `@/components/icons` để đồng nhất size/weight và an toàn cho Server Components (bản `/dist/ssr`). **Không tự vẽ SVG inline.**"
      },
      {
        "type": "note",
        "text": "🔎 Duyệt toàn bộ icon (2000+, 6 weight) tại **[phosphoricons.com](https://phosphoricons.com)**. Cần icon chưa có trong danh sách dưới → import tên Phosphor rồi bọc qua `icon()` trong `@/components/icons` (VD `export const RocketIcon = icon(Rocket)`), **không dán SVG tay**. Logo thương hiệu (Google/GitHub/Vercel…) là ngoại lệ, nằm ở `@/components/brand-icons`."
      },
      {
        "type": "h",
        "text": "Usage"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { BellIcon, PlusIcon } from \"@/components/icons\";\n\n<BellIcon width={20} height={20} />\n<PlusIcon width={20} height={20} className=\"text-orange\" />"
      },
      {
        "type": "p",
        "text": "Mỗi wrapper nhận `width`/`height` (map sang `size` của Phosphor), `weight`, `className` (màu theo `currentColor` → dùng `text-*`)."
      },
      {
        "type": "h",
        "text": "Toàn bộ icon — 1500+, đều dùng được"
      },
      {
        "type": "p",
        "text": "**Mọi** icon Phosphor đã được wrap thành `*Icon` trong `@/components/icons` (auto-gen — `npm run icons:sync`). Import cái nào cũng được, VD `RocketIcon`, `AddressBookIcon`. **Không còn \"bộ icon cũ\" giới hạn** — cả thư viện là một hệ."
      },
      {
        "type": "p",
        "text": "Gallery render bằng **web-font** (nhẹ, không bundle 1500 SVG); nhãn là **tên code `*Icon`** dùng trực tiếp được. Alias/weight thân thiện (VD `EditIcon`, `RollbackIcon`, `SearchIcon`) vẫn giữ trong `icons.tsx` và thắng khi trùng tên."
      },
      {
        "type": "demo",
        "key": "PhosphorBrowser"
      }
    ]
  },
  {
    "id": "installation",
    "group": "Getting Started",
    "title": "Cài đặt",
    "origin": "installation",
    "blocks": [
      {
        "type": "p",
        "text": "DSVH sống **trong** repo `vibe-host-ui` (Next.js 16 + React 19 + Tailwind v4) — chưa tách package. Import trực tiếp từ `@/components`."
      },
      {
        "type": "h",
        "text": "Yêu cầu"
      },
      {
        "type": "ul",
        "items": [
          "Token đã khai trong `src/app/globals.css` (2 lớp primitive → semantic).",
          "Inter (`--font-sans`) + JetBrains Mono (`--font-mono`) tự host qua `next/font`. Trước 05/08/2026 Inter nạp bằng `@import` Google Fonts và đo ra 0 request thật → app chạy bằng font hệ điều hành.",
          "Icon: `@phosphor-icons/react` (bọc trong `@/components/icons`)."
        ]
      },
      {
        "type": "h",
        "text": "Dùng component"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { Button } from \"@/components/ui/Button\";\nimport { Card, CardHeader } from \"@/components/ui/Card\";\nimport { Table } from \"@/components/ui/Table\";\nimport { FileUpload } from \"@/components/ui/FileUpload\";\n\nexport default function Page() {\n  return (\n    <Card>\n      <CardHeader title=\"Report\" />\n      <Button variant=\"solid\">Create New</Button>\n    </Card>\n  );\n}"
      },
      {
        "type": "h",
        "text": "Cho AI (vibe-code)"
      },
      {
        "type": "p",
        "text": "Trước khi sinh UI, đọc:"
      },
      {
        "type": "ul",
        "items": [
          "[`/llms.txt`](/llms.txt) — brief + rules + recipe intent→build.",
          "[`/dsvh.json`](/dsvh.json) — token + component + props (máy đọc)."
        ]
      },
      {
        "type": "h",
        "text": "Thư viện dùng"
      },
      {
        "type": "p",
        "text": "`tailwind-variants` (variant), `recharts` (chart), `cmdk` (search docs), `@next/mdx` + `rehype-pretty-code` (trang tài liệu này)."
      },
      {
        "type": "demo",
        "key": "InstallationDemo"
      }
    ]
  },
  {
    "id": "motion",
    "group": "Core Concepts",
    "title": "Chuyển động",
    "origin": "motion",
    "blocks": [
      {
        "type": "p",
        "text": "Chuyển động tiết chế, có ý đồ — vào-khung mượt, phản hồi tương tác rõ, và **luôn tôn trọng `prefers-reduced-motion`**. Thời lượng phổ biến: 200ms (hover), 300ms (layout), 700–1100ms (vẽ chart / count-up)."
      },
      {
        "type": "h",
        "text": "Count-up (KPI)"
      },
      {
        "type": "p",
        "text": "Số liệu chạy từ 0 → giá trị thật (ease-out) khi vào khung nhìn."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { CountUp } from \"@/components/motion/CountUp\";\n\n<CountUp end={67} />"
      },
      {
        "type": "demo",
        "key": "CountUpDemo"
      },
      {
        "type": "h",
        "text": "Hover lift (Card)"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"rounded-card border border-stroke bg-surface p-4\n  transition duration-300 hover:-translate-y-[3px]\n  hover:shadow-[0_16px_44px_-16px_rgba(10,13,20,0.16)]\">…</div>"
      },
      {
        "type": "demo",
        "key": "HoverLiftDemo"
      },
      {
        "type": "h",
        "text": "Progress fill"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"h-1.5 rounded-full bg-stroke-soft overflow-hidden\">\n  <div className=\"h-full rounded-full bg-orange-bright\" style={{ width: \"70%\" }} />\n</div>"
      },
      {
        "type": "demo",
        "key": "ProgressDemo"
      },
      {
        "type": "h",
        "text": "Nguyên tắc"
      },
      {
        "type": "ul",
        "items": [
          "**Reveal on scroll**: dùng `<Reveal>` (`@/components/motion/Reveal`) để card fade + trượt lên khi cuộn tới; stagger bằng `delay`.",
          "**Chart**: line vẽ từ trái→phải, bar mọc từ đáy (Recharts `animationDuration`).",
          "**Reduced motion**: mọi animation tự tắt khi user bật giảm chuyển động."
        ]
      }
    ]
  },
  {
    "id": "patterns-assistant",
    "group": "Patterns",
    "title": "Mẫu: Assistant",
    "origin": "patterns/assistant",
    "blocks": [
      {
        "type": "p",
        "text": "Các **phần tử** của màn AI Co-Pilot — chỉ **khu quản lý chat** (CoPilotPanel) + **vùng chat** (AssistantMain), **không kèm rail Sidebar** app. Tương tác thật: gõ prompt rồi Enter, đính kèm tệp, bấm chip/template → chuyển sang luồng hội thoại, phản hồi **mô phỏng stream** như Claude/ChatGPT (chưa nối model thật). Xem bản đầy đủ trong app ở [/assistant](/assistant)."
      },
      {
        "type": "demo",
        "key": "AssistantDemo"
      },
      {
        "type": "h",
        "text": "Cấu trúc"
      },
      {
        "type": "ul",
        "items": [
          "**Rail**: cùng `<Sidebar defaultCollapsed/>` với dashboard (KHÔNG dựng sidebar thứ 2 — dùng chung 1 component).",
          "**CoPilot panel**: danh sách chat/worksheets (drawer trên mobile).",
          "**Main**: hero + `<PromptInput/>` + chips gợi ý + template cards + footer."
        ]
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"flex min-h-screen bg-canvas\">\n  <Sidebar defaultCollapsed mobileOpen={navOpen} onClose={…} />\n  <main className=\"flex-1 p-2 sm:p-3\">\n    <div className=\"flex rounded-3xl border border-stroke bg-surface overflow-hidden\">\n      <CoPilotPanel /> <AssistantMain />\n    </div>\n  </main>\n</div>"
      },
      {
        "type": "h",
        "text": "Nguyên tắc"
      },
      {
        "type": "ul",
        "items": [
          "**PromptInput**: textarea auto-grow, Enter gửi / Shift+Enter xuống dòng, nút send `bg-ink` disable khi rỗng.",
          "**Chips**: pill viền (xem [Badge & Chip](/dsvh/badge)).",
          "**Template cards**: [Card](/dsvh/card) hover-lift, dấu chấm màu = avatar nhóm.",
          "Layout dùng lại y hệt shell dashboard để **đồng bộ** giữa các trang."
        ]
      }
    ]
  },
  {
    "id": "patterns-dashboard",
    "group": "Patterns",
    "title": "Mẫu: Dashboard",
    "origin": "patterns/dashboard",
    "blocks": [
      {
        "type": "p",
        "text": "Các **phần tử** cấu thành dashboard — render trực tiếp bằng chính component đang chạy (KPI tiles, line/area/bar chart, ribbon, agent list), **không kèm Shell/Sidebar** app. Reuse component thật nên chart không bao giờ lệch. Xem bản đầy đủ trong app ở [Analytics](/)."
      },
      {
        "type": "demo",
        "key": "DashboardDemo"
      },
      {
        "type": "h",
        "text": "Cấu trúc"
      },
      {
        "type": "ul",
        "items": [
          "**Shell**: `<Sidebar/>` (dark, collapse được) + panel trắng bo góc trên nền canvas.",
          "**Topbar**: tiêu đề trang + subtitle + action (bell, Invite).",
          "**Grid card**: 12 cột trên desktop, gộp dần xuống tablet/mobile."
        ]
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<Shell>\n  <div className=\"grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-12\">\n    <Reveal className=\"md:col-span-2 xl:col-span-7\"><MonthlyTraffic /></Reveal>\n    <Reveal className=\"md:col-span-2 xl:col-span-5\"><UserGrowth /></Reveal>\n    {/* … */}\n  </div>\n</Shell>"
      },
      {
        "type": "h",
        "text": "Nguyên tắc"
      },
      {
        "type": "ul",
        "items": [
          "Mỗi ô là một [Card](/dsvh/card); card cùng hàng đặt `h-full` để bằng chiều cao.",
          "KPI dùng [Stat Tile](/dsvh/stat-tile) + [CountUp](/dsvh/motion).",
          "Chart theo [Charts](/dsvh/charts) convention; entrance bằng `<Reveal>` stagger.",
          "Khoảng cách: `gap-4` → `lg:gap-5`; padding panel `p-2 sm:p-3`."
        ]
      },
      {
        "type": "h",
        "text": "Responsive"
      },
      {
        "type": "p",
        "text": "`grid-cols-1` (mobile) → `md:grid-cols-2` (tablet) → `xl:grid-cols-12` (desktop). Card đơn lẻ dùng `col-span` theo tỉ lệ 7/5 · 4/4/4 · 8/4."
      }
    ]
  },
  {
    "id": "patterns-states",
    "group": "Patterns",
    "title": "Mẫu: Trạng thái (loading/empty/error)",
    "origin": "patterns/states",
    "blocks": [
      {
        "type": "p",
        "text": "Mọi khối dữ liệu cần xử lý đủ 3 trạng thái ngoài \"có dữ liệu\"."
      },
      {
        "type": "h",
        "text": "Loading (skeleton)"
      },
      {
        "type": "p",
        "text": "Dùng khối `bg-stroke-soft` bo góc + `animate-pulse` mô phỏng bố cục thật (không dùng spinner cho nội dung dạng list/bảng). [Table](/dsvh/table) có sẵn skeleton."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"animate-pulse space-y-2\">\n  <div className=\"h-4 w-2/3 rounded bg-stroke-soft\" />\n  <div className=\"h-4 w-1/2 rounded bg-stroke-soft\" />\n</div>"
      },
      {
        "type": "h",
        "text": "Empty"
      },
      {
        "type": "p",
        "text": "Icon trong khung `bg-surface-2` + tiêu đề + mô tả + (tuỳ chọn) CTA. Giọng văn thân thiện, gợi hành động tiếp theo."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"flex flex-col items-center gap-3 py-8 text-center\">\n  <div className=\"rounded-2xl border border-stroke bg-surface-2 p-3 text-ink-3\">📄</div>\n  <p className=\"font-semibold text-ink\">Chưa có dữ liệu</p>\n  <p className=\"text-sm text-ink-3\">Tạo mục đầu tiên để bắt đầu.</p>\n</div>"
      },
      {
        "type": "h",
        "text": "Error"
      },
      {
        "type": "p",
        "text": "Thông báo lỗi bằng `text-orange` (hệ DSVH dùng cam cho lỗi), kèm nút thử lại. Không đổ lỗi kỹ thuật cho người dùng — mô tả ngắn + hành động."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"flex items-center gap-3 rounded-xl border border-orange/30 bg-orange/5 p-3\">\n  <span className=\"text-sm text-orange\">Không tải được dữ liệu.</span>\n  <Button size=\"sm\" variant=\"ghost\">Thử lại</Button>\n</div>"
      },
      {
        "type": "demo",
        "key": "StatesDemo"
      }
    ]
  },
  {
    "id": "principles",
    "group": "Getting Started",
    "title": "Nguyên tắc",
    "origin": "principles",
    "related": ["PageShell", "Empty"],
    "blocks": [
      {
        "type": "p",
        "text": "Bốn nguyên tắc DSVH bám theo."
      },
      {
        "type": "h",
        "text": "1. Token-first, không hardcode"
      },
      {
        "type": "p",
        "text": "Mọi màu/spacing/radius đi qua semantic token. Đổi ở một nơi, lan toả mọi nơi. Đây là điều kiện để theming & đa brand."
      },
      {
        "type": "h",
        "text": "2. Tái sử dụng, không nhân bản"
      },
      {
        "type": "p",
        "text": "Một khái niệm — một component. Không dựng sidebar/thanh menu/thẻ card thứ 2. Docs này render component **thật** để không lệch sản phẩm."
      },
      {
        "type": "h",
        "text": "3. Thân thiện với AI"
      },
      {
        "type": "p",
        "text": "Utility-first + token + component có tài liệu = luật rõ ràng → AI sinh UI **deterministic**, không \"AI-generic\". Manifest máy đọc giúp AI map mockup/BA/wireframe → đúng DSVH."
      },
      {
        "type": "h",
        "text": "4. Đủ trạng thái, đủ a11y"
      },
      {
        "type": "p",
        "text": "Không chỉ happy-path: mọi khối dữ liệu xử lý loading/empty/error; mọi control có focus + label + bàn phím. Chuyển động tôn trọng `prefers-reduced-motion`."
      },
      {
        "type": "p",
        "text": "---"
      },
      {
        "type": "note",
        "text": "\"Design system tốt là cái mà cả người mới lẫn AI đều dựng ra UI đúng ngay từ lần đầu.\""
      },
      {
        "type": "demo",
        "key": "PrinciplesDemo"
      }
    ]
  },
  {
    "id": "radius",
    "group": "Foundations",
    "title": "Bo góc",
    "origin": "radius",
    "related": ["Card / CardHeader", "Button", "Input"],
    "blocks": [
      {
        "type": "p",
        "text": "Thang bo góc theo cấp độ phần tử — nhỏ cho control, lớn dần tới panel bao ngoài."
      },
      {
        "type": "h",
        "text": "Scale"
      },
      {
        "type": "demo",
        "key": "RadiusGrid"
      },
      {
        "type": "h",
        "text": "Quy ước"
      },
      {
        "type": "ul",
        "items": [
          "`rounded-md` (6px) — kbd, badge nhỏ.",
          "`rounded-lg` (8px) — button, input, pill, menu item.",
          "`rounded-xl` (12px) — button lớn, nav item, icon box.",
          "`rounded-card` / `rounded-2xl` (16px) — **card chuẩn DSVH**.",
          "`rounded-3xl` (24px) — panel bao ngoài (app shell)."
        ]
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"rounded-card border border-stroke bg-surface p-4\">card</div>"
      }
    ]
  },
  {
    "id": "responsive",
    "group": "Core Concepts",
    "title": "Responsive",
    "origin": "responsive",
    "related": ["Table", "PageShell", "Card / CardHeader"],
    "blocks": [
      {
        "type": "p",
        "text": "DSVH mobile-first, dùng breakpoint mặc định của Tailwind."
      },
      {
        "type": "note",
        "text": "**App này tối ưu cho PC.** Dải phổ thông: 1366 · 1440 · 1600 · 1920. Hai luật đi kèm: (1) vùng nội dung có TRẦN `max-w-[1600px] mx-auto` đặt ở `app/(app)/layout.tsx` — không có trần thì ở 2560px nội dung giãn tới 2296px, mắt quét ngang quá xa và cột bảng bị kéo thưa; trần 1600 KHÔNG đụng tới 1366/1440/1600 (vùng nội dung 1076/1150/1310px, đều dưới trần). (2) Bảng nhiều cột dùng `hideBelow` trên `ColumnDef` để bỏ cột TRÙNG THÔNG TIN ở màn hẹp, thay vì bắt cuộn ngang — chỉ ẩn cột lấy được thông tin ở chỗ khác, KHÔNG ẩn dữ liệu duy nhất."
      },
      {
        "type": "h",
        "text": "Breakpoints"
      },
      {
        "type": "table",
        "head": [
          "Prefix",
          "≥",
          "Dùng cho"
        ],
        "rows": [
          [
            "(base)",
            "0",
            "Mobile"
          ],
          [
            "`sm`",
            "640px",
            "Mobile lớn"
          ],
          [
            "`md`",
            "768px",
            "Tablet"
          ],
          [
            "`lg`",
            "1024px",
            "Desktop (sidebar tĩnh)"
          ],
          [
            "`xl`",
            "1280px",
            "Desktop rộng (grid 12 cột, TOC docs)"
          ]
        ]
      },
      {
        "type": "h",
        "text": "Nguyên tắc"
      },
      {
        "type": "ul",
        "items": [
          "**Sidebar**: drawer < `lg`, tĩnh ≥ `lg`; có thể collapse thành icon-rail.",
          "**Grid dashboard**: `grid-cols-1` → `md:grid-cols-2` → `xl:grid-cols-12`.",
          "**Bảng**: bọc `overflow-x-auto` để cuộn ngang thay vì vỡ layout — NHƯNG chừng đó chưa đủ. Đo thật 05/08 ở `/admin/deployments` (1024px): bảng CÓ cuộn (1216 > 642px) mà header vẫn rớt 3 dòng, cao 77px. Ba việc phải làm ĐỦ: (1) `whitespace-nowrap` trên `<th>` — không có thì nhãn dài tự xuống dòng và hàng tiêu đề cao gấp đôi; (2) vệt mờ hai mép báo còn nội dung — `overflow-x-auto` cho cuộn được nhưng KHÔNG nói cho người dùng biết là cuộn được, cột cuối bị cắt gọn ở mép trông như bảng chỉ có ngần ấy cột; (3) scrollbar mảnh. Cả ba đã nằm sẵn trong `Table` của DSVH — dùng component, đừng tự bọc `<table>` thô.",
          "**Topbar**: ẩn subtitle/nhãn phụ < `sm`; nút chỉ còn icon.",
          "**Ẩn/hiện**: `hidden lg:block`, `lg:hidden`… nhưng ưu tiên **reflow** hơn ẩn."
        ]
      },
      {
        "type": "h",
        "text": "Kiểm thử"
      },
      {
        "type": "p",
        "text": "Luôn kiểm 3 mốc: **390** (mobile) · **834** (tablet) · **1440** (desktop)."
      },
      {
        "type": "demo",
        "key": "ResponsiveDemo"
      }
    ]
  },
  {
    "id": "shadows",
    "group": "Foundations",
    "title": "Đổ bóng",
    "origin": "shadows",
    "blocks": [
      {
        "type": "p",
        "text": "Bóng đổ dùng tiết chế, chủ yếu để tạo **độ nổi khi tương tác** (hover) và cho lớp nổi (tooltip, dropdown, drawer). Nền tĩnh gần như phẳng, phân tách bằng `border-stroke`."
      },
      {
        "type": "h",
        "text": "Elevation levels"
      },
      {
        "type": "demo",
        "key": "ShadowGrid"
      },
      {
        "type": "h",
        "text": "Quy ước"
      },
      {
        "type": "ul",
        "items": [
          "**Card**: mặc định phẳng (chỉ border). Khi hover → `hover:-translate-y-[3px]` + bóng mềm.",
          "**Tooltip / floating card**: `shadow-[0_8px_24px_rgba(10,13,20,0.12)]`.",
          "**Dropdown / menu**: `shadow-lg shadow-black/5`.",
          "**Drawer / mobile sidebar**: `shadow-2xl`."
        ]
      }
    ]
  },
  {
    "id": "sidebar",
    "group": "Layout",
    "title": "Sidebar",
    "origin": "sidebar",
    "related": ["PageShell", "TabsNav"],
    "blocks": [
      {
        "type": "p",
        "text": "**Một** component nav dùng chung mọi trang — dark `#212230`, collapse thành icon-rail, drawer trên mobile, active item tự nhận theo `usePathname()`. Bấm nút toggle ở đầu mỗi rail để xem chuyển động thu/mở."
      },
      {
        "type": "demo",
        "key": "SidebarDemo"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { Sidebar } from \"@/components/Sidebar\";\n\n<Sidebar />                    {/* dashboard: mở rộng */}\n<Sidebar defaultCollapsed />   {/* assistant: rail */}\n<Sidebar embedded />           {/* nhúng trong khung (demo) */}"
      },
      {
        "type": "h",
        "text": "3 vùng — phần tử cố định"
      },
      {
        "type": "p",
        "text": "Sidebar chia **3 vùng dọc** để một số phần tử luôn hiển thị dù nav dài:"
      },
      {
        "type": "ul",
        "items": [
          "**Header cố định (trên)**: brand `Lunor Workspace` · `Create New` · `Search` (⌘K).",
          "**Nav cuộn (giữa)**: main nav · `Settings`/`Help` — `flex-1 overflow-y-auto`, chỉ vùng này cuộn.",
          "**Footer cố định (dưới)**: card `Upgrade` (thu gọn → nút sparkle) · `profile`."
        ]
      },
      {
        "type": "h",
        "text": "Đặc điểm"
      },
      {
        "type": "ul",
        "items": [
          "**Collapse**: nút toggle ở đầu; mở rộng (264px) ↔ rail (84px), animation mượt (`transition-[width]` + nhãn fade). Icon căn giữa khi thu gọn.",
          "**Active tự động**: khớp `href === pathname` (Analytics active ở `/`, AI Assistant ở `/assistant`).",
          "**Mobile**: `fixed` drawer, trượt từ trái, backdrop + `Esc`.",
          "**`embedded`**: render nội dòng (`relative h-full`) trong container thay vì `fixed/sticky` full màn — để nhúng vào docs/pattern demo."
        ]
      },
      {
        "type": "h",
        "text": "Props"
      },
      {
        "type": "p",
        "text": "{ name: \"defaultCollapsed\", type: \"boolean\", default: \"false\", description: \"Bắt đầu ở dạng rail.\" }, { name: \"embedded\", type: \"boolean\", default: \"false\", description: \"Render nội dòng (relative h-full) trong container thay vì fixed/sticky full màn — cho demo/nhúng.\" }, { name: \"mobileOpen\", type: \"boolean\", description: \"Điều khiển drawer (mobile).\" }, { name: \"onClose\", type: \"()=>void\", description: \"Đóng drawer.\" }, ]} />"
      },
      {
        "type": "note",
        "text": "**Không** tạo sidebar thứ 2. Mọi trang import cùng component này để đồng bộ — đây là bài học đã sửa trong dự án."
      }
    ]
  },
  {
    "id": "spacing",
    "group": "Foundations",
    "title": "Khoảng cách",
    "origin": "spacing",
    "related": ["PageShell", "Card / CardHeader"],
    "blocks": [
      {
        "type": "p",
        "text": "DSVH dùng thang spacing của Tailwind (bội số 4px) cho `gap`, `p`, `m`. Giữ nhịp đều để layout nhất quán."
      },
      {
        "type": "h",
        "text": "Scale"
      },
      {
        "type": "demo",
        "key": "SpacingScale"
      },
      {
        "type": "h",
        "text": "Nhịp chuẩn (đã dùng trong app)"
      },
      {
        "type": "ul",
        "items": [
          "**Padding card**: `p-4` (mobile) → `sm:p-5`.",
          "**Gap giữa card trong grid**: `gap-4` → `lg:gap-5`.",
          "**Header card ↔ nội dung**: `mb-4`.",
          "**Label ↔ value**: `gap-1` / `space-y-1`.",
          "**Chiều cao control**: `h-9` (36px) hoặc `h-10` (40px)."
        ]
      },
      {
        "type": "h",
        "text": "Usage"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<div className=\"flex flex-col gap-4 p-5\">\n  <div className=\"h-8 rounded-lg bg-stroke-soft\" />\n  <div className=\"h-8 rounded-lg bg-stroke-soft\" />\n</div>"
      }
    ]
  },
  {
    "id": "theming",
    "group": "Core Concepts",
    "title": "Sáng / Tối",
    "origin": "theming",
    "related": ["Card / CardHeader", "Badge"],
    "blocks": [
      {
        "type": "p",
        "text": "DSVH hỗ trợ **light + dark** qua thuộc tính `data-theme` trên `<html>`. Vì token tách 2 lớp, dark mode chỉ **remap lớp semantic** — component không đổi một dòng."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "import { ThemeToggle } from \"@/components/theme/ThemeToggle\";\n\n<ThemeToggle />"
      },
      {
        "type": "demo",
        "key": "ThemeToggleDemo"
      },
      {
        "type": "h",
        "text": "Bật theme"
      },
      {
        "type": "p",
        "text": "Bọc app bằng `ThemeProvider`, và chèn **anti-FOUC script** ở đầu `<body>` để đặt `data-theme` TRƯỚC khi React hydrate (tránh nhấp nháy). Đọc/đổi qua `useTheme()` hoặc nút `ThemeToggle`."
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "// layout.tsx\n<html suppressHydrationWarning>\n  <body>\n    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />\n    <ThemeProvider>{children}</ThemeProvider>\n  </body>\n</html>"
      },
      {
        "type": "h",
        "text": "Cơ chế"
      },
      {
        "type": "p",
        "text": "Dark chỉ định nghĩa lại **neutral** (surface / ink / lines / canvas); **accent** (orange/teal/red…) giữ nguyên hue để bám thương hiệu:"
      },
      {
        "type": "code",
        "lang": "css",
        "code": ":root[data-theme=\"dark\"] {\n  --color-surface: #1a1b23;\n  --color-ink: #eef1f2;\n  --color-stroke: #2d2f3d;\n  /* accent giữ nguyên */\n}"
      },
      {
        "type": "p",
        "text": "Vì component chỉ dùng `bg-surface`, `text-ink`, `border-stroke`… nên **tự đổi** theo theme — không phải sửa từng cái. Đây là phần thưởng của luật *không hardcode hex*."
      },
      {
        "type": "h",
        "text": "Quy tắc"
      },
      {
        "type": "ul",
        "items": [
          "**Không hardcode hex** — chỉ semantic token mới flip được (`lint:tokens` gác việc này).",
          "Chữ trên nền **cream** (nút Create New…) dùng `text-cream-ink` — token này **không** bị override ở dark (cream là surface sáng ở cả 2 theme).",
          "Luôn kiểm **cả light lẫn dark** trước khi báo xong."
        ]
      },
      {
        "type": "h",
        "text": "Đổi accent / đa thương hiệu"
      },
      {
        "type": "p",
        "text": "Đổi accent = thêm primitive rồi trỏ semantic vào nó:"
      },
      {
        "type": "code",
        "lang": "css",
        "code": ":root { --brand-600: #2563eb; }\n@theme { --color-orange: var(--brand-600); }  /* mọi bg-orange đổi theo */"
      },
      {
        "type": "p",
        "text": "Mỗi brand = một bộ primitive + **cùng** bộ tên semantic → component viết một lần, chạy mọi brand."
      },
      {
        "type": "h",
        "text": "API"
      },
      {
        "type": "p",
        "text": "{ name: \"ThemeProvider\", type: \"component\", description: \"Bọc app (1 lần) ở layout.\" }, { name: \"useTheme()\", type: \"() => { theme, setTheme, toggle }\", description: \"Đọc/đổi theme trong client component.\" }, { name: \"ThemeToggle\", type: \"component\", description: \"Nút chuyển sáng/tối.\" }, { name: \"data-theme\", type: \"'light' | 'dark'\", description: \"Thuộc tính trên <html> (nguồn chân lý).\" }, ]} />"
      }
    ]
  },
  {
    "id": "tokens",
    "group": "Core Concepts",
    "title": "Token (tổng quan)",
    "origin": "tokens",
    "related": ["Badge", "Button", "Card / CardHeader"],
    "blocks": [
      {
        "type": "p",
        "text": "DSVH dùng token **2 lớp**, single source ở `globals.css`."
      },
      {
        "type": "h",
        "text": "Lớp 1 — primitive"
      },
      {
        "type": "p",
        "text": "Bảng màu gốc, đặt tên theo hue-shade, **không** sinh utility:"
      },
      {
        "type": "code",
        "lang": "css",
        "code": ":root {\n  --ink-900: #001d21;  --ink-700: #334a4d;  --ink-500: #64797c;\n  --paper-0: #ffffff;  --line-200: #dfe6e6;  --navy-900: #212230;\n  --orange-600: #de4400;  --orange-500: #f5872a;  --teal-500: #21b37a;\n}"
      },
      {
        "type": "h",
        "text": "Lớp 2 — semantic (`@theme`)"
      },
      {
        "type": "p",
        "text": "Ánh xạ primitive → **vai trò**, và chính lớp này sinh ra utility Tailwind:"
      },
      {
        "type": "code",
        "lang": "css",
        "code": "@theme {\n  --color-ink: var(--ink-900);        /* → text-ink */\n  --color-surface: var(--paper-0);    /* → bg-surface */\n  --color-canvas: var(--navy-900);    /* → bg-canvas (dark shell) */\n  --color-orange: var(--orange-600);  /* → bg-orange / text-orange */\n  --radius-card: 16px;                 /* → rounded-card */\n}"
      },
      {
        "type": "p",
        "text": "Đổi 1 giá trị primitive → lan toả toàn hệ thống. **Component không bao giờ hardcode hex**, chỉ tham chiếu semantic."
      },
      {
        "type": "h",
        "text": "Palette"
      },
      {
        "type": "p",
        "text": "Giá trị thật của từng token — màu, bo góc, cỡ chữ — nằm ở [Bảng token](/dsvh/bang-token). Riêng luật dùng màu theo vai trò thì ở [Màu](/dsvh/colors). Mục này chỉ nói token **là gì** và vì sao gọi theo vai trò."
      },
      {
        "type": "h",
        "text": "Radius"
      },

      {
        "type": "note",
        "text": "Bản máy đọc: [`/dsvh.json`](/dsvh.json) · brief cho AI: [`/llms.txt`](/llms.txt)."
      }
    ]
  },
  {
    "id": "typography",
    "group": "Foundations",
    "title": "Typography",
    "origin": "typography",
    "blocks": [
      {
        "type": "p",
        "text": "Font hệ thống là **Inter** (`--font-sans`), tự host qua `next/font`. App dùng MỘT font duy nhất — không `font-mono`; cần chữ số thẳng cột thì `tabular-nums`."
      },
      {
        "type": "h",
        "text": "Thang chữ — 8 bậc CÓ TÊN"
      },
      {
        "type": "note",
        "text": "Chốt 06/08/2026. Trước đó app dùng **23 cỡ** khác nhau (9 · 9.5 · 10 · 10.5 · 11 · 11.5 · 12 · 12.5 · 13 · 13.5 · 14 · 14.5 · 15 · 16 · 17 · 18 · 20 · 22 · 24 · 28 · 30 · 32 · 34) — trong đó **95 chỗ là cỡ nửa pixel**, dấu hiệu chỉnh bằng mắt chứ không theo thang nào. Hai khối chữ lệch nhau 0.5–1px trên cùng màn đọc ra đúng cảm giác \"font chưa đồng bộ\" dù cùng một font. Đã gom **1139 chỗ** về 8 bậc."
      },
      {
        "type": "table",
        "head": [
          "Gõ",
          "px",
          "Dùng cho"
        ],
        "rows": [
          [
            "`text-micro`",
            "10",
            "Nhãn siêu nhỏ: badge `size=sm`, % trong thanh đo"
          ],
          [
            "`text-meta`",
            "11",
            "Meta: nhãn nhóm menu, ngày, chú thích mờ"
          ],
          [
            "`text-caption`",
            "12",
            "Chữ phụ: mô tả, `text-ink-2` / `text-ink-3`"
          ],
          [
            "`text-body`",
            "14",
            "Nội dung chính, nhãn form, mục menu"
          ],
          [
            "`text-title`",
            "16",
            "Tiêu đề thẻ / khối"
          ],
          [
            "`text-page`",
            "24",
            "Tiêu đề trang"
          ],
          [
            "`text-kpi`",
            "28",
            "Số KPI trong StatCard"
          ],
          [
            "`text-hero`",
            "34",
            "Số lớn nhất / hero"
          ]
        ]
      },
      {
        "type": "demo",
        "key": "TypeScale"
      },
      {
        "type": "h",
        "text": "Luật"
      },
      {
        "type": "ul",
        "items": [
          "Đặt tên theo VAI, không theo số — gõ `text-caption` thì không ai nghĩ ra `text-[12.5px]` nữa.",
          "**KHÔNG** dùng `text-[Npx]` tuỳ tiện, cũng **KHÔNG** dùng thang Tailwind gốc (`text-xs/sm/base/lg/xl/2xl`) — dùng song song hai thang thì lại thành hai nguồn. Gate `TYPESCALE` trong `ds:check` chặn cả hai.",
          "Phân cấp ưu tiên bằng **màu** (`ink` → `ink-2` → `ink-3`) rồi mới tới cỡ; không quá 2–3 bậc cỡ trong một khối.",
          "Body 14 / phụ 12 — cách nhau 2px nên phân cấp rõ. (Bản cũ 14/13 chỉ cách 1px, mắt gần như không phân biệt được.)"
        ]
      }
    ]
  },
  {
    "id": "wording",
    "group": "Guidelines",
    "title": "Câu chữ",
    "origin": "wording",
    "blocks": [
      {
        "type": "p",
        "text": "Câu chữ trên UI thuộc trách nhiệm **BA** (rà soát sau khi test). DSVH đưa nguyên tắc chung để giữ giọng nhất quán."
      },
      {
        "type": "h",
        "text": "Nguyên tắc"
      },
      {
        "type": "ul",
        "items": [
          "**Ngôn ngữ người dùng**, không kỹ thuật. \"Không tải được dữ liệu\" thay vì \"Fetch error 500\".",
          "**Ngắn, chủ động**: nút là động từ (\"Tạo mới\", \"Mời\", \"Nâng cấp\"), không \"Bấm để…\".",
          "**Nhất quán thuật ngữ**: một khái niệm — một từ (đừng lúc \"xoá\" lúc \"gỡ\").",
          "**Thông báo lỗi** = mô tả ngắn + hành động khắc phục, không đổ lỗi người dùng.",
          "**Empty state** gợi bước tiếp theo, không chỉ nói \"trống\".",
          "**i18n**: chuỗi do AI sinh sẵn (Claude/agy), BA **review & duyệt**, không tự gõ từng chuỗi."
        ]
      },
      {
        "type": "h",
        "text": "Quy trình"
      },
      {
        "type": "p",
        "text": "Wording chốt sau khi test trên hệ thống thật; DEV đặt biến i18n, **áp đề xuất chỉnh của BA**, không tự chế câu chữ."
      },
      {
        "type": "h",
        "text": "Ví dụ"
      },
      {
        "type": "table",
        "head": [
          "Nên",
          "Không nên"
        ],
        "rows": [
          [
            "\"Chưa có dữ liệu\"",
            "\"No data available (empty set)\""
          ],
          [
            "\"Mời thành viên\"",
            "\"Bấm vào đây để mời\""
          ],
          [
            "\"Không gửi được, thử lại\"",
            "\"Error: request failed\""
          ]
        ]
      },
      {
        "type": "demo",
        "key": "WordingDemo"
      }
    ]
  },
  {
    "id": "page-anatomy",
    "group": "Layout",
    "title": "Cấu trúc trang (bắt buộc đọc trước khi dựng trang mới)",
    "origin": "(mới — không có ở /dsvh cũ)",
    "blocks": [
      {
        "type": "p",
        "text": "Design system tài liệu hoá **viên gạch** (component, token) nhưng trước nay KHÔNG tài liệu hoá **bản vẽ ngôi nhà**. Hệ quả: dựng trang mới thì mỗi người ghép một kiểu, và không ai trả lời được câu \"trang mới sẽ trông thế nào\". Mục này là bản vẽ đó — rút thẳng từ `/dashboard` đang chạy thật."
      },
      {
        "type": "h",
        "text": "Giải phẫu một trang"
      },
      {
        "type": "ul",
        "items": [
          "**Khung ngoài** — do `app/(app)/layout.tsx` lo: rail tối bên trái + topbar (đổi ngôn ngữ, sáng/tối, tài khoản). Trang KHÔNG tự dựng lại phần này.",
          "**Vùng nội dung** — `<PageShell>`. Nhịp dọc giữa các khối luôn là `space-y-6`, và ĐỆM/NHỊP do chính component lo — đừng tự gõ lại lớp đó (sửa 20/08/2026: bản cũ ghi nguyên chuỗi class, tức tài liệu đang DẠY đúng cái anti-pattern mà `PageShell` sinh ra để xoá; đếm được 7 tệp chép tay).",
          "**1. Tiêu đề trang** — `<PageHeader title subtitle />`. Luôn là khối đầu tiên.",
          "**2. Hàng KPI** — `grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4`, thường 4 ô. Số liệu tóm tắt, KHÔNG bấm được.",
          "**3. Thẻ nội dung** — `<Card>` + `<CardHeader title />`. Thẻ tĩnh (form/settings) tắt hiệu ứng: `hoverShadow={false} hoverLift={false}`.",
          "**4. Dải nhắc/CTA** (tuỳ trang) — một `Card` ngang, icon trái + text + nút phải.",
          "**5. Danh sách** — `Card` bọc `Table`, kèm trạng thái trống (`Empty`) và phân trang."
        ]
      },
      {
        "type": "h",
        "text": "Khung xương copy được"
      },
      {
        "type": "code",
        "lang": "tsx",
        "code": "<PageShell title={t(\"page.title\")} subtitle={t(\"page.subtitle\")}>\n\n  {/* 1. Hàng KPI */}\n  <div className=\"grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4\">\n    <StatCard icon={GlobeIcon} label=\"Tổng website\" value={0} desc=\"Tất cả website của bạn\" />\n    {/* … 3 ô nữa */}\n  </div>\n\n  {/* 2. Thẻ nội dung tĩnh */}\n  <Card hoverShadow={false} hoverLift={false}>\n    <CardHeader title=\"Tài nguyên gói\" />\n    {/* … */}\n  </Card>\n\n  {/* 3. Danh sách + trạng thái trống */}\n  <Card>\n    <CardHeader title=\"Danh sách website\" />\n    {rows.length ? <Table data={rows} columns={cols} /> : <Empty title=\"Chưa có website nào\" action={<Button>Triển khai mới</Button>} />}\n  </Card>\n</div>"
      },
      {
        "type": "demo",
        "key": "PageAnatomyDemo"
      },
      {
        "type": "h",
        "text": "Ba khối dựng trang HIỆN CHƯA thuộc design system"
      },
      {
        "type": "note",
        "text": "Đo ngày 05/08/2026: `PageHeader` (17 file dùng), `StatCard`, `EmptyState` đang nằm ở `src/components/shared/**` chứ không phải trong DSVH — nên trước đây trang `/dsvh` không mô tả nổi cấu trúc trang. Nặng hơn: `StatCard` dựng bằng token **shadcn** (`bg-card`, `text-muted-foreground`, `bg-primary/10`) và icon **lucide-react**, tức 4 ô KPI trên dashboard KHÔNG theo DSVH."
      },
      {
        "type": "ul",
        "items": [
          "Hệ quả thật: đổi brand hay đổi theme thì phần dùng `--color-*` (DSVH) đổi theo, phần dùng `--primary/--muted` (shadcn) thì không — trang lệch làm đôi.",
          "Đã thêm gate `TOKENMIX` khoá mức nền **27 file** cho mỗi loại: code cũ ân xá, code mới KHÔNG được thêm. Xem `npm run ds:check`.",
          "Việc còn lại (đã ghi trong Sổ thiếu): đưa `PageHeader`/`StatCard`/`EmptyState` vào DSVH và dựng lại bằng token DSVH."
        ]
      }
    ]
  }
];
