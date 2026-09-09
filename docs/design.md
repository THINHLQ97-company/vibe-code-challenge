# Design System — "Mắt Bão Mockup Kit" (chính thức)

> **Lịch sử sửa (2026-09-09, 2 lần)**:
> 1. Bản đầu (Step 1) dùng nhầm `dsvh` (design system nội bộ của Vibe Host, tông
>    Teal/Orange) thay vì bộ user chuẩn bị riêng cho dự án này.
> 2. Sửa lần 1 chuyển sang `design-system.css` nhưng qua một LỚP ALIAS trung gian
>    (đổi tên `orange`→trỏ indigo, `teal`→trỏ success...) — user phản hồi đây vẫn
>    KHÔNG PHẢI "dùng y chang": một class tên `text-orange` mà render ra màu indigo
>    là gây hiểu lầm, không truy vết được về token gốc. Đã sửa lần 2: bỏ hẳn lớp
>    alias, `tailwind.config.ts` trỏ THẲNG vào biến `--ds-*`, đặt tên class đúng
>    nghĩa gốc (`text-success`, không phải `text-teal`).
> 3. Đồng thời thay toàn bộ icon emoji (🏠📝🧩...) bằng SVG thật (`lucide-react`) —
>    DESIGN.md không nói rõ bộ icon nhưng "dùng icon có sẵn không phải .svg" bị
>    đánh giá là "dơ", nhất quán với tinh thần "clean SaaS admin" của kit.

## Nguồn — KHÔNG có bản sao/alias nào khác

- `docs/reference/design-system.css` — bản gốc do user cung cấp. Copy nguyên văn
  vào `app/design-system.css`, `@import` trong `app/globals.css`. **Không sửa giá
  trị token.**
- `docs/reference/DESIGN.md` — luật cứng: không hex/px thô, mockup trước khi code
  (nợ thiết kế — các màn đã dựng trước khi phát hiện nhầm hệ, chưa qua bước mockup
  riêng), responsive 3 cỡ, wording qua BA (chưa có BA review).
- `lucide-react` — bộ icon SVG dùng cho TOÀN BỘ icon trong app (sidebar nav, empty
  state, badge, nút bấm, checklist...). Không còn icon nào là emoji/ký tự Unicode
  giả icon (✓ ○ ↗ → 🌀 🏆 v.v. đều đã thay bằng component SVG tương ứng).

## Cách dùng trong Next.js/Tailwind — trỏ THẲNG, không đổi tên

`tailwind.config.ts` — mỗi key màu/chữ/bo góc/đổ bóng trỏ **trực tiếp** vào 1 biến
`--ds-*`, tên key giữ nguyên hoặc rất sát nghĩa gốc:

| Tailwind key | Biến `--ds-*` | Ghi chú |
|---|---|---|
| `background` | `--ds-bg` | |
| `foreground` | `--ds-fg` | |
| `muted-foreground` | `--ds-fg-mute` | |
| `subtle` | `--ds-fg-subtle` | tên mới, TRUNG THỰC theo `fg-subtle` gốc, không tái dùng tên khác |
| `card` | `--ds-surface` | |
| `primary` / `primary-hover` | `--ds-primary` / `--ds-primary-hover` | |
| `secondary` | `--ds-surface-raised` | đúng nền `.ds-btn` mặc định trong kit |
| `accent` | `--ds-primary-light` | đúng hover-state `.ds-btn-ghost` trong kit |
| `destructive` | `--ds-danger` | |
| `success` / `warning` / `info` (+ `-bg`) | `--ds-success` / `--ds-warning` / `--ds-info` | tên MỚI trung thực, không tái dùng `teal`/`amber` |
| `border` / `border-strong` | `--ds-border` / `--ds-border-strong` | |
| `ring` | `--ds-primary-mute` | |

Thang chữ dùng ĐÚNG tên chuẩn Tailwind (`text-xs/sm/base/md/lg/xl/2xl`), chỉ đổi
GIÁ TRỊ theo `--ds-font-size-*` — không còn vocabulary tự chế (`text-hero`,
`text-kpi`...).

Class `.ds-*` thuần (`.ds-btn`, `.ds-card`, `.ds-badge`, `.ds-table`, `.ds-empty`,
`.ds-alert`, `.kpi`/`.kpirow`/`.kcard`, `.panel`, `.barlist`, `.ds-nav`) dùng trực
tiếp làm `className` khi cần đúng pattern trong file gốc — xem `app/admin/page.tsx`,
`components/app-shell.tsx`, `components/empty-state.tsx`.

## Icon

Import trực tiếp từ `lucide-react`, `size` theo ngữ cảnh (16px sidebar/inline,
18-22px tiêu đề/logo, 36px empty state). **Lưu ý RSC**: `NavItem.icon` trong
`components/app-shell.tsx` nhận `ReactNode` (JSX đã dựng, vd `<Home size={16}/>`),
KHÔNG nhận component reference (`icon: Home`) — vì `AppShell` là Client Component
("use client") còn nav được định nghĩa ở Server Component (`layout.tsx`); truyền
thẳng function qua ranh giới Server→Client Component sẽ lỗi runtime "Functions
cannot be passed directly to Client Components". `EmptyState` không bị giới hạn
này (component reference `icon: LucideIcon` OK) vì cả nó lẫn nơi gọi đều là Server
Component, không qua ranh giới nào.

## Component shadcn cũ (Button/Card/Input/Label/Badge/Table/Textarea/Stepper)

Giữ cấu trúc gốc (copy từ `docs/reference/dsvh-source/ui/`), chỉ dùng token màu ở
trên — không còn tên biến nào gợi nhớ tới `dsvh`.

## Dark mode

`design-system.css` hỗ trợ cả `prefers-color-scheme: dark` và `[data-theme="dark"]`
— project hiện **chưa bật toggle** (nội bộ, ít giá trị ưu tiên với iMVP).
