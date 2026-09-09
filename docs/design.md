# Design System — "Mắt Bão Mockup Kit" (chính thức)

> ⚠️ **Sửa lại 2026-09-09**: bản đầu của file này (Step 1) đã dùng nhầm design system
> `dsvh` (design system nội bộ của chính sản phẩm Vibe Host, tông Teal/Orange) trong khi
> user đã chuẩn bị sẵn 1 bộ RIÊNG cho dự án này — `docs/reference/design-system.css` +
> `docs/reference/DESIGN.md` (tông Indigo, "Mắt Bão Mockup Kit", clean SaaS admin). Đã port
> lại toàn bộ token sang đúng bộ này — xem lịch sử git để biết chi tiết sửa.

## Nguồn

- `docs/reference/design-system.css` — bản gốc do user cung cấp, copy nguyên vào
  `app/design-system.css` và `@import` trong `app/globals.css`. **Không sửa tay** file
  này trừ khi bản gốc cũng đổi — giữ đồng bộ.
- `docs/reference/DESIGN.md` — luật cứng: không hex/px thô (mọi màu/khoảng cách qua
  token `--ds-*`), mockup trước khi code (chưa áp dụng nghiêm ngặt cho các màn đã dựng
  trước khi phát hiện nhầm design system — ghi nhận là nợ thiết kế), responsive 3 cỡ,
  wording qua BA (chưa áp dụng — chưa có BA review).

## Cách dùng trong Next.js/Tailwind

`design-system.css` viết cho dùng "song song với Tailwind CDN" (thuần class `.ds-*`),
khác với stack Next.js + Tailwind PostCSS của dự án này. Cách tích hợp:

1. **Token** (`--ds-primary`, `--ds-fg`, `--ds-border`...): map vào alias ngữ nghĩa
   shadcn/ui (`--background`, `--foreground`, `--primary`...) trong `app/globals.css`,
   rồi `tailwind.config.ts` trỏ `colors.background` v.v. vào các alias đó → component
   port từ dsvh trước đây (Button/Card/Input/Badge/Table — dùng class Tailwind
   `bg-primary`, `text-foreground`...) tự động lên đúng màu Indigo, không cần sửa JSX.
2. **Class `.ds-*` thuần** (`.ds-btn`, `.ds-card`, `.ds-badge`, `.ds-table`, `.ds-empty`,
   `.ds-alert`, `.kpi`/`.kpirow`/`.kcard`, `.panel`, `.barlist`, `.ds-nav`...): dùng trực
   tiếp làm `className` trong JSX khi cần đúng pattern trong file gốc (dashboard KPI,
   sidebar nav, empty/error state) — xem `app/admin/page.tsx`, `components/app-shell.tsx`,
   `components/empty-state.tsx` làm ví dụ.
3. Tailwind utility (`flex`, `gap-4`, `grid-cols-2`...) vẫn dùng bình thường cho layout —
   chỉ MÀU/RADIUS/SHADOW/FONT-SIZE phải qua token, không tự chế hex/px.

## Component đã dựng theo pattern design-system.css

- `components/app-shell.tsx` — sidebar app-shell dùng `.ds-nav`/`.ds-nav-item` +
  `--ds-sidebar-bg`, thay cho layout top-nav đơn giản ban đầu (chưa đúng tinh thần kit).
- `components/empty-state.tsx` — wrapper `.ds-empty`, dùng ở mọi danh sách rỗng
  (topics/posts/appeals/scoring/leaderboard/các trang guard "chưa có đề tài") — DESIGN.md
  bắt buộc empty state có thật, không phải màn trắng.
- `app/admin/page.tsx` — `.kpirow`/`.kcard` cho dải KPI + `.panel`/`.barlist` cho biểu đồ
  phân bổ nhóm chủ đề, đúng pattern "DASHBOARD" (mục 19) trong file gốc.
- `app/dashboard/results/page.tsx` — `.ds-alert-warning` cho trạng thái chờ công bố.

## Component shadcn cũ (Button/Card/Input/Label/Badge/Table/Textarea/Stepper)

Giữ nguyên cấu trúc (copy từ `docs/reference/dsvh-source/ui/`), chỉ đổi NGUỒN MÀU qua
bước 1 ở trên. Đã xoá `components/ui/stat-tile.tsx` (dsvh StatTile) vì không còn call
site nào sau khi đổi dashboard sang `.kpirow`/`.kcard` — tránh code chết. `Stepper` vẫn
giữ (dùng ở `app/dashboard/page.tsx` cho thanh tiến độ 3-phase), màu đã tự đổi Indigo qua
bước 1 vì chỉ dùng Tailwind alias (`bg-orange`→primary), không hardcode hex.

## Dark mode

`design-system.css` hỗ trợ cả `prefers-color-scheme: dark` VÀ `[data-theme="dark"]` —
project hiện **chưa bật toggle** (nội bộ, ít giá trị ưu tiên với iMVP).
