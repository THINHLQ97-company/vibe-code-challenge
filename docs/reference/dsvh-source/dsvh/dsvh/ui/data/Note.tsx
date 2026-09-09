import type { ReactNode } from "react";

import { InfoIcon, WarningIcon } from "@/components/dsvh/icons";
import { tv } from "../../tv";

/**
 * GHI CHÚ TĨNH — một câu giải thích luôn hiện, gắn dưới khối mà nó nói về.
 *
 * ĐƯA VÀO DSVH 20/08/2026 sau khi đếm 7 bản viết tay cùng một khuôn
 * `rounded-lg border border-stroke bg-surface-2 px-3 py-2` + icon + `text-caption text-ink-2`, ở
 * `backups` · `ai-usage-card` · `add-domain-wizard` · `tab-ai` · `legacy-backups` ·
 * `domains-manager` · `database`. Bảy chỗ lệch nhau về cỡ icon (14 ↔ 16), cỡ chữ (caption ↔ body)
 * và màu chữ (ink-2 ↔ ink-3).
 *
 * ── VÌ SAO KHÔNG DÙNG `Alert tone="info"` ───────────────────────────────────────────────────
 *
 * Nhìn thì gần giống, nhưng khác ở NGHĨA, và cái khác đó có hậu quả đo được:
 *
 *   · `Alert` mang `role="alert"` — một vùng LIVE của ARIA. Trình đọc màn hình NGẮT LỜI để đọc nó
 *     ngay khi nó xuất hiện. Đúng cho "vừa có chuyện xảy ra"; sai cho một câu giải thích vốn nằm
 *     đó từ đầu. Bảy chỗ này mà thành `Alert` là bảy lần ngắt lời mỗi lần mở trang.
 *   · `Alert` là thành phần của HỆ TRẠNG THÁI (luật 7: tone lấy từ `status.ts`). Ghi chú không có
 *     trạng thái nào — nó không "đang tốt" hay "đang hỏng".
 *
 * Ranh giới gọn: trạng thái VỪA ĐỔI hoặc CẦN người xử lý ⇒ `Alert`. Câu giải thích LUÔN ĐÚNG,
 * luôn hiện ⇒ `Note`.
 *
 * ── MỘT CỠ CHỮ, KHÔNG CÓ PROP `size` ────────────────────────────────────────────────────────
 *
 * Bảy bản cũ chia 5 `text-caption` / 2 `text-body`. Chọn `text-caption`: ghi chú là vai PHỤ, để nó
 * bằng cỡ nội dung chính thì nó tranh chỗ đọc với chính thứ nó đang giải thích. Thêm prop `size`
 * là mời mỗi nơi gọi tự chọn lại — đúng thứ đã sinh ra 7 bản lệch nhau.
 *
 * ── `tone` THÊM 21/08/2026 ──────────────────────────────────────────────────────────────────
 *
 * Bản đầu cố ý không có tone, vì ghi chú "không đang tốt hay đang hỏng". Đo lại thì thấy vế đó chỉ
 * đúng một nửa: đếm được 14 khối tự gõ ở 12 tệp theo đúng khuôn này nhưng nền hổ phách / đỏ — và
 * chúng KHÔNG phải thông báo trạng thái vừa đổi. Chúng là câu cảnh báo LUÔN ĐÚNG về hệ quả của
 * tình trạng hiện tại: "chưa liên kết thì không được sao lưu", "danh sách IP rỗng nghĩa là mở cho
 * cả Internet". Ép sang `Alert` thì mỗi lần mở trang là một lần trình đọc màn hình bị ngắt lời cho
 * một câu vốn nằm sẵn ở đó; để nguyên thì 14 chỗ tiếp tục lệch nhau.
 *
 * Ranh giới vẫn nguyên: `Alert` = VỪA XẢY RA / cần xử lý ngay (có `role="alert"`).
 * `Note tone="warning|danger"` = hệ quả luôn đúng của tình trạng đang có, không ngắt lời ai.
 */
export const noteVariants = tv({
  base: "flex items-start gap-2 rounded-lg border px-3 py-2 text-caption",
  variants: {
    tone: {
      neutral: "border-stroke bg-surface-2 text-ink-2",
      warning: "border-amber/40 bg-amber/15 text-ink-2",
      danger: "border-red/40 bg-red/15 text-ink-2",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export interface NoteProps {
  children: ReactNode;
  /**
   * `neutral` (mặc định) giải thích; `warning` nói một hệ quả xấu đang treo; `danger` nói một rủi
   * ro đang mở. Icon đi theo tone chứ không để nơi gọi truyền — dấu chấm than trên nền trung tính
   * và chữ i trên nền đỏ đều là những cặp sai mà không gate nào bắt được.
   */
  tone?: "neutral" | "warning" | "danger";
  /**
   * Bỏ icon khi ghi chú nằm trong một khối vốn đã có dấu nhận biết riêng, hoặc khi nó chỉ là một
   * dòng phụ thuộc về ô ngay trên (vd chú thích "mật khẩu đã niêm phong" ở /databases).
   */
  icon?: boolean;
  className?: string;
}

export function Note({ children, tone = "neutral", icon = true, className = "" }: NoteProps) {
  const Icon = tone === "neutral" ? InfoIcon : WarningIcon;
  const iconTone =
    tone === "danger" ? "text-red" : tone === "warning" ? "text-amber-strong dark:text-amber" : "";
  return (
    <p className={noteVariants({ tone, className })}>
      {icon ? <Icon size={14} className={`mt-0.5 shrink-0 ${iconTone}`} aria-hidden /> : null}
      <span className="min-w-0">{children}</span>
    </p>
  );
}
