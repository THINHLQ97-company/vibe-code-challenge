"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n";

import { InfoIcon } from "@/components/dsvh/icons";
import { Tooltip } from "@/components/dsvh/ui/Tooltip";

/**
 * DẤU HỎI CHÚ THÍCH — icon chữ i, rê/tab vào thì hiện câu giải thích.
 *
 * ĐƯA VÀO DSVH 26/08/2026, gộp từ bản viết trong `CardHeader` (20/08) và bản `FormField` cần thêm
 * ngay lượt này. Hai chỗ dựng riêng thì chỉ vài ngày là lệch: cỡ icon, màu, có phải nút thật hay
 * không, nhãn cho trình đọc màn hình.
 *
 * ── MỘT TÊN CHO MỘT KHÁI NIỆM ───────────────────────────────────────────────────────────────
 *
 * Trước lượt này DSVH gọi `hint` cho HAI thứ khác nhau: ở `CardHeader` nó là TOOLTIP, ở `FormField`
 * nó là DÒNG CHỮ hiện sẵn dưới ô nhập. Đếm nơi gọi để chọn nghĩa nào được giữ tên: `hint` dạng
 * dòng-hiện có 10+ chỗ, `hint` dạng tooltip có 3. Nên `hint` giữ nghĩa DÒNG HIỆN, còn tooltip đổi
 * hết sang `tip` — ở cả `CardHeader` lẫn `FormField`.
 *
 * ── NÚT THẬT, KHÔNG PHẢI `<span>` ───────────────────────────────────────────────────────────
 *
 * `Tooltip` mở theo `onFocusCapture`, nên phần tử con phải nhận được tiêu điểm bàn phím. Bọc một
 * thẻ không focus được thì chú thích chỉ tồn tại cho người dùng chuột.
 * Icon xám theo luật 8: icon không mang nghĩa trạng thái thì không tô màu.
 */
export function HintTip({ content }: { content: ReactNode }) {
  const { t } = useTranslation();
  return (
    <Tooltip content={content}>
      <button
        type="button"
        aria-label={t("ds.hint_aria")}
        className="inline-flex shrink-0 rounded text-ink-3 transition-colors hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/40"
      >
        <InfoIcon size={16} />
      </button>
    </Tooltip>
  );
}
