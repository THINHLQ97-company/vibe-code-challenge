import { createTV } from "tailwind-variants";

/**
 * `tv()` của DSVH — BẮT BUỘC dùng bản này, KHÔNG import thẳng từ `tailwind-variants`.
 *
 * Vì sao phải bọc lại: `tailwind-variants` gộp class bằng `tailwind-merge`, mà thư viện đó chỉ biết
 * thang cỡ chữ MẶC ĐỊNH của Tailwind (`text-xs`, `text-sm`, `text-base`…). Thang 8 bậc của DSVH
 * (`text-body`, `text-caption`…) là khoá theme TỰ ĐẶT nên nó không nhận ra là cỡ chữ — và đoán nhầm
 * sang nhóm MÀU CHỮ. Hậu quả: trong cùng một component, class cỡ chữ đứng sau sẽ ĐÈ MẤT class màu.
 *
 * Đo thật ngày 06/08 trên `Button`:
 *     variant solid → "bg-orange text-white"
 *     size    md    → "h-9 px-4 text-body"
 *     kết quả gộp   → "bg-orange … h-9 px-4 text-body"   ← `text-white` BIẾN MẤT
 * Nút CTA cam thành chữ đen (`rgb(0,29,33)` = `--color-ink` kế thừa) trên toàn app. 15/16 component
 * DSVH có đủ cả hai loại variant nên đều dính.
 *
 * Khai `fontSize` ở đây để `tailwind-merge` xếp đúng nhóm: cỡ chữ chỉ đè cỡ chữ, màu chỉ đè màu.
 * THÊM BẬC MỚI vào `dsvh-tokens.css` thì PHẢI thêm vào danh sách này, nếu không lỗi tái diễn âm thầm.
 *
 * `rounded-card` (`--radius-card: 16px`) dính ĐÚNG cơ chế đó ở nhóm bo góc — đo được ở khung xương
 * /admin/dashboard 14/08: `` ra 8px vì lớp lạ không đè được lớp gốc.
 * Chi tiết ghi ở `lib/utils.ts`; khai ở cả hai chỗ vì component shadcn đi qua `cn()` còn component
 * DSVH đi qua `tv()`.
 */
export const tv = createTV({
  twMergeConfig: {
    extend: {
      classGroups: {
        "font-size": [
          {
            text: ["micro", "meta", "caption", "body", "title", "page", "kpi", "hero"],
          },
        ],
        rounded: [{ rounded: ["card"] }],
      },
    },
  },
});
