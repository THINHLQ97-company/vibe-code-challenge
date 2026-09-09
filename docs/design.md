# Design System — dùng token & component từ Vibe Host (dsvh)

Nguồn gốc: `docs/reference/dsvh-source/` — bản xuất từ design system nội bộ của chính Vibe Host (Next.js 15 + Tailwind + shadcn/ui + radix-ui). Vì `matbao-vibe-challenge` scaffold từ `next-fullstack-starter` (cùng Next.js + Tailwind), ta copy trực tiếp token & component thay vì port CSS sang stack khác.

## Token màu/chữ/bo góc

Port từ `docs/reference/dsvh-source/dsvh/dsvh/tokens-data.ts` (41 token, sinh tự động từ `src/styles/dsvh-tokens.css` gốc — file CSS gốc không có trong bản export nên token được viết tay lại vào `app/globals.css` theo đúng giá trị hex/px trong `tokens-data.ts`).

Khai báo ở `app/globals.css` (`:root` = light, `.dark` = dark override) và map thành Tailwind utility ở `tailwind.config.ts`:

- **Màu nền/chữ dsvh**: `canvas, surface, surface-2, surface-hover, ink, ink-2, ink-3, stroke, stroke-soft, stroke-hover, stroke-strong, stroke-focus, cream, cream-100/200/300, cream-ink, orange, orange-bright, orange-strong, red, red-strong, amber, amber-strong, peach, yellow, teal, teal-strong, mint, magenta, link, link-hover` — dùng trực tiếp làm class Tailwind: `bg-ink`, `text-ink-2`, `border-stroke`, `bg-orange`...
- **Alias ngữ nghĩa shadcn/ui** (để các component copy từ dsvh chạy được không cần sửa): `background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring`. Map: `primary` = `--color-orange` (CTA chính), `destructive` = `--color-red`, `accent` = `--color-cream-100`. **Nếu BA muốn đổi màu CTA chính khác cam, chỉ sửa 1 dòng `--primary` trong `app/globals.css`.**
- **Thang chữ**: `text-micro(10px) meta(11px) caption(12px) body(14px) title(16px) page(24px) kpi(28px) hero(34px)`.
- **Bo góc**: `rounded-card` = 16px (dùng cho Card/panel lớn), `rounded-lg/md/sm` theo `--radius` chuẩn shadcn (8px) cho input/button.

## Component đã port (Step 1)

`components/ui/`: `button.tsx, card.tsx, input.tsx, label.tsx, badge.tsx` — copy nguyên từ `docs/reference/dsvh-source/ui/`, không sửa (stock shadcn, chỉ phụ thuộc token ở trên + `lib/utils.ts#cn()`).

## Component CHƯA port — port dần theo từng bước PLAN khi cần

Còn rất nhiều component trong `docs/reference/dsvh-source/ui/` (table, select, dialog, tabs, checkbox, progress, tooltip...) và `docs/reference/dsvh-source/dsvh/dsvh/ui/` (StatTile, Stepper, FileUpload, Badge, SegmentedControl, form/*, charts/kit.tsx, AuthCard...) — **không copy trước khi có màn hình thật sự cần**, tránh code chết. Khi tới bước PLAN cần (vd Step 3 cần AuthCard cho trang login, Step 9 cần StatTile cho dashboard), copy từ thư mục reference tương ứng, kiểm tra import (nhiều file phụ thuộc `lucide-react`, `cmdk`, `sonner`, `react-hook-form`, `recharts`... — thêm dependency khi thực sự dùng, không cài sẵn hàng loạt).

**Lưu ý khi port thêm**: `docs/reference/dsvh-source` bị loại khỏi TypeScript compile (`tsconfig.json` → `exclude`) vì nó chỉ là tài liệu tham khảo, không phải code chạy — sau khi copy 1 file sang `components/`, nhớ kiểm tra lại import path (`@/lib/utils`, `@/components/ui/...`) khớp với cấu trúc project này.

## Theme tối (dark mode)

Đã khai báo `.dark` override đầy đủ trong `app/globals.css` (đúng giá trị dsvh gốc), nhưng **iMVP không bật toggle dark mode** (nội bộ, ít giá trị ưu tiên) — để sẵn hạ tầng cho Phase 2 nếu cần.
