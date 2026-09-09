# Design system — DSVH (nguồn sự thật)

**Nguồn sự thật duy nhất: `DSVH.html`** (bản trích tài liệu design system của VAYS Panel /
Vibe Host — 94 component · 41 token · 35 cổng tự động). Mọi quyết định về màu, thang chữ, icon,
component đều tra ở đó trước.

> Lịch sử: dự án từng đi lạc qua hai hệ khác (một bản dsvh port dở, rồi "Mắt Bão Mockup Kit" tông
> Indigo trong `docs/reference/design-system.css`). Cả hai đã bị gỡ. Hai file trong
> `docs/reference/` giữ lại chỉ để tra lịch sử, **không phải nguồn sự thật**.

## Đang dùng thật trong repo

| Thứ | Ở đâu | Ghi chú |
|---|---|---|
| Token màu/chữ/bo góc | `app/globals.css` | Đúng giá trị bảng Token của DSVH.html, có cả theme tối qua `[data-theme="dark"]` |
| Map token → utility | `tailwind.config.ts` | Giữ nguyên tên: `bg-surface`, `text-ink-2`, `border-stroke`, `text-orange`, `text-body`, `rounded-card`… |
| `tv()` | `components/dsvh/tv.ts` | Bắt buộc dùng bản này, không import thẳng `tailwind-variants` |
| `cn()` | `lib/utils.ts` | Khai cùng thang chữ cho tailwind-merge (luật #21 — thiếu thì class cỡ chữ đè mất class màu) |
| Component | `components/dsvh/**` | Port nguyên văn từ DSVH, ~60 file |
| Icon | `components/dsvh/icons.tsx` | Phosphor qua wrapper `icon()` |
| Ngày giờ | `lib/datetime.ts` | Cổng NGAYTHANG: mọi định dạng ngày đi qua đây |
| Chuỗi component | `lib/i18n.ts` | Thay `react-i18next` bằng module vi một chỗ |

## Ba chỗ CỐ Ý lệch bản gốc (và vì sao)

1. **`icons.tsx` không `export *` từ file generated.** Bản gốc re-export cả ~1530 icon; file đó
   import hết ở module scope nên webpack không tree-shake được — đo thật trên app này: một chunk
   **4.7 MB**, First Load JS **100 kB → 1.12 MB** trên MỌI trang. Nay khai thẳng 28 icon đang
   dùng qua đúng wrapper `icon()`; bundle về **164 kB**. Cần icon mới thì thêm một dòng, tra tên
   ở phosphoricons.com — vẫn KHÔNG vẽ SVG tay (luật #5).
2. **`react-i18next` → `lib/i18n.ts`.** App chỉ chạy tiếng Việt, không kéo cả framework i18n vào.
   Giữ nguyên API `useTranslation()` nên code component DSVH không phải sửa, và câu chữ vẫn nằm
   tập trung một chỗ để BA sửa.
3. **`Card.tsx` thêm `"use client"`.** Component dùng `useState`/`useRef` (dropdown PeriodPill) —
   Next.js App Router bắt buộc directive này, bản gốc chạy trong app có cấu hình khác.

Không port nhóm `ui/deploy/**`, `LogViewer`, `MetricGauge`, `ResourceMeter`, `TreeGuide`,
`charts/kit` — đó là component của panel hosting, app cuộc thi không có màn nào dùng.

## Luật DSVH đang áp trong code này

- Token-only, không hex thô (ngoại lệ đã khai: gradient logo thương hiệu trong `icons.tsx`).
- Thang chữ ĐÚNG 8 bậc: `text-micro/meta/caption/body/title/page/kpi/hero`. **Không** dùng
  `text-xs/sm/base/lg/xl` của Tailwind gốc.
- Liên kết dùng token `link`/`link-hover` (xanh dương), **không** `text-orange` — cam để dành cho
  nút chính.
- Icon trang trí để xám (`bg-stroke-soft text-ink-2`), chỉ tô màu khi mang nghĩa trạng thái.
- Status tone một nguồn (`components/dsvh/status.ts`): success = teal · warning = amber · error =
  đỏ · info = neutral.
- `Note` cho ghi chú TĨNH, `Alert` cho trạng thái VỪA đổi / cần xử lý (`Alert` có `role="alert"`,
  trình đọc màn hình ngắt lời ngay).
- `Empty` luôn kèm `action` khi có lối đi tiếp; nằm trong `Card` thì dùng variant `inline`.
- Mọi trang bọc `PageShell` (đệm ngoài + nhịp dọc + `PageHeader`).
- Nền `canvas` (tối ở CẢ hai theme) đi với chữ `cream`, không ghim `text-white`.

## Chưa làm

- Chưa có cổng tự động (`ds:check`, `ds:probe`…) như repo gốc — luật hiện dựa vào review, không có
  phép kiểm. Nếu app lớn thêm thì port `ds:check` là việc đáng làm tiếp.
- Chưa bật nút chuyển sáng/tối (token đã sẵn, chỉ thiếu `data-theme` toggle).
