"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "@/components/dsvh/icons";
// Sổ đăng ký lớp phủ dùng CHUNG (xem `overlay-stack.ts`) — không để riêng trong tệp này, vì
// `Drawer`/`UploadModal`/`Command` cũng phải nhập cùng một sổ thì thứ tự lớp mới là một sự thật
// duy nhất. Ghi hai sổ là quay lại đúng bài toán ban đầu ở quy mô nhỏ hơn.
import { pushOverlay, popOverlay, isTopOverlay } from "@/components/dsvh/overlay-stack";
import { statusStyles, type Status } from "@/components/dsvh/status";

export type ModalTone = "default" | Status;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Cho phép người dùng ĐÓNG hộp thoại hay không. Mặc định `true`.
   *
   * ── VÌ SAO PHẢI LÀ MỘT PROP, KHÔNG ĐỂ NƠI GỌI TỰ CHẶN TRONG `onClose` ────────────────────────────
   *
   * Báo lỗi 14/08 (Popup đang triển khai không đóng được): ba hộp thoại đang tự chặn bằng
   * `onClose={() => { if (!dangChay) setOpen(false) }}`. Nhưng Modal có tới BA lối đóng — nút X,
   * phím Esc, bấm ra nền — và cả ba đều gọi `onClose`. Chặn kiểu đó không tắt lối nào cả: nút X vẫn
   * hiện, vẫn sáng lên khi rê chuột, bấm vào thì KHÔNG CÓ GÌ XẢY RA. Người dùng bấm ba bốn lần rồi
   * kết luận trang bị treo — đúng như phiếu báo lỗi ghi.
   *
   * Nghịch lý trong chính phiếu đó ("FAIL" ở cột kiểm thử, "Tắt được" ở cột phản hồi) cũng từ đây:
   * cả hai đều đúng, chỉ khác thời điểm — ngoài lúc đang chạy thì tắt được, trong lúc đang chạy thì
   * không. Không ai sai, chỉ là giao diện không nói ra mình đang ở trạng thái nào.
   *
   * `closable={false}` gỡ HẲN cả ba lối và ẩn nút X — không còn cái nút nào để bấm hụt. Luật "đang
   * chạy thì không cho đóng" giữ nguyên (đóng giữa chừng là người dùng mất dấu một việc vẫn đang
   * chạy ở nền), chỉ thôi giả vờ là có lối thoát.
   */
  closable?: boolean;
  /** Trạng thái có icon dẫn (info/success/warning/error) — badge màu theo tone. */
  tone?: ModalTone;
  /** Icon tuỳ biến (đè icon mặc định của tone). Có icon/tone → hiện badge. */
  icon?: ReactNode;
  /**
   * Ghim CHIỀU CAO thay vì co theo lượng nội dung thật. Mặc định `false` (không ghim) — hộp thoại
   * xác nhận ngắn (`ConfirmDialog`) co vừa nội dung là đúng, ghim cao cố định cho loại đó chỉ tạo
   * khoảng trắng thừa vô nghĩa. Bật khi nội dung DAO ĐỘNG nhiều theo lựa chọn của người dùng (vd
   * dialog Thêm/Sửa mẫu — tab Image/Git đổi số trường, danh sách biến môi trường thêm/bớt) — không
   * ghim thì mỗi lần đổi trạng thái, hộp thoại đổi cao/thấp theo, nút Lưu/Hủy nhảy vị trí dù đã cố
   * định trong khung nhìn của modal.
   *
   * - `true` → ghim ở đúng mức TRẦN màn hình (`h-[calc(100vh-3rem)]`) — dùng khi nội dung thật sự
   *   dài, gần chạm trần thường xuyên.
   * - `string` (class Tailwind cho `height`, vd `"h-[min(820px,calc(100vh-3rem))]"`) → ghim ở một
   *   mức TỰ CHỌN, thấp hơn mức trần — dùng khi đo thực tế nội dung KHÔNG cần chạm hẳn mức trần,
   *   ghim `true` (mức trần) sẽ để lại khoảng trắng thừa phía dưới nội dung/trước footer. LUÔN kẹp
   *   trong `min(…, calc(100vh-3rem))` để vẫn co đúng trên màn hình thấp (mobile) — tự viết class,
   *   Modal không tự thêm phần kẹp này.
   * KHI NÀO **KHÔNG** GHIM — mặc định nên là không ghim, hộp thoại ôm sát nội dung:
   * - Chiều cao chỉ đổi vì NGƯỜI DÙNG tự thêm/bớt dòng (thêm biến môi trường, thêm bản ghi DNS…).
   *   Hộp thoại cao dần theo là phản hồi đúng cho thao tác của họ, không phải "nhảy giật" — TRỪ KHI
   *   hộp canh giữa màn và biên độ lớn: lúc đó mỗi lần thêm một dòng là khung nở ra HAI ĐẦU, mọi thứ
   *   người dùng đang nhìn (kể cả nút họ vừa bấm) đều trượt đi. Ngưỡng đo được ở "Thêm mẫu triển
   *   khai": mỗi biến +106px, ba biến là +290px — đã ghim `h-[780px]` cho ca đó ngày 08/08.
   * - Chưa ĐO mà mới phỏng đoán là nội dung dao động. Ghim là đánh đổi: khoảng trắng thừa hiện
   *   100% thời gian, để đổi lấy việc chặn một cú nhảy có thể không tồn tại. Bắt được thật ở hộp
   *   thoại "Thêm mẫu triển khai" (`/admin/templates`): ghim 820px vì tưởng đổi tab Image↔Git làm
   *   nhảy chiều cao, đo lại bằng Playwright thì hai tab cao BẰNG NHAU — con số 820 đó là phỏng
   *   đoán, thừa 49px trắng ở ca thường gặp nhất. Nay ghim lại ở 780px, nhưng là con số ĐO ĐƯỢC
   *   (771px lúc 0 biến + dự phòng làm tròn), không phải đoán.
   * Ghim chỉ xứng đáng khi chiều cao đổi do thứ NGOÀI tầm kiểm soát của người dùng (nội dung tải
   * bất đồng bộ, đổi bước wizard) VÀ đã đo được biên độ dao động thật.
   */
  fixedHeight?: boolean | string;
}

/**
 * Bề rộng CHẶN hai đầu: `sm:w-auto` để vừa nội dung (ngắn không kéo rộng), kẹp
 * trong `[min, max]` để không quá hẹp / quá rộng. Mobile: `w-full`.
 */
/* Trần nới một nấc ngày 08/08: 480/620/780/980 → 500/640/800/1000.
   Lý do đo được, không phải làm tròn cho đẹp: hàng "biến môi trường" ở `/admin/templates` cần
   192 (tên) + 288 (ba công tắc) + 180 (giá trị, tối thiểu) + 32 (nút X) + 36 (ba khe) = 728px, mà
   `lg` cũ chỉ chừa 730px cho hàng — sát đến mức chỉ cần ô giá trị nở ra một chút là nút X rớt xuống
   dòng riêng. Nới `lg` lên 800 ⇒ hàng có 750px, dư 22px thật sự.
   Bốn bậc nới cùng nhau để thang giữ nguyên nhịp; đổi mỗi `lg` sẽ làm bậc đó gần `xl` hơn `md`. */
const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "sm:min-w-[400px] sm:max-w-[500px]",
  md: "sm:min-w-[460px] sm:max-w-[640px]",
  lg: "sm:min-w-[540px] sm:max-w-[800px]",
  xl: "sm:min-w-[620px] sm:max-w-[1000px]",
  /**
   * BẬC MỚI 07/09/2026 — thêm chứ KHÔNG nới `xl`.
   *
   * `xl` đang có 6 nơi gọi, trong đó `admin-templates` và `stack-diagram-dialog` tính bố cục cột
   * theo đúng bề ngang đó ("ngân sách bề ngang… tối đa 980px trừ px-6 hai bên"). Nới `xl` là âm
   * thầm đổi bố cục của cả sáu, và hai chỗ kia sẽ lệch mà không có gì đỏ.
   *
   * Vì sao `min-w` mới là con số đáng quan tâm: panel để `sm:w-auto`, tức nó CO VỪA NỘI DUNG rồi
   * mới bị kẹp giữa min/max. Hộp thoại nhiều bước có bước đầu chỉ một ô nhập — nội dung hẹp nên nó
   * rơi đúng về `min-w`, còn `max-w` không bao giờ chạm tới. Muốn hộp thoại rộng thật thì phải nâng
   * `min-w`, nâng `max-w` một mình là không đổi gì cả.
   */
  "2xl": "sm:min-w-[820px] sm:max-w-[1160px]",
};

export function Modal({
  open,
  onClose,
  closable = true,
  title,
  description,
  children,
  footer,
  size = "md",
  tone = "default",
  icon,
  fixedHeight = false,
}: ModalProps) {
  /**
   * `onClose`/`closable` đọc qua ref, KHÔNG qua mảng phụ thuộc của effect.
   *
   * Nếu để chúng trong deps thì mọi nơi gọi truyền hàm nội tuyến (`onClose={() => setOpen(false)}`
   * — tức gần như mọi nơi) sẽ khiến effect chạy lại SAU MỖI LƯỢT DỰNG. Effect chạy lại nghĩa là
   * gỡ mình khỏi sổ rồi đẩy vào lại, tức TỰ NHẢY LÊN ĐỈNH: lớp dưới chỉ cần render lại một lần là
   * nó cướp quyền nhận Esc của lớp đang thật sự ở trên. Đăng ký phải bám đúng một thứ — `open`.
   */
  const cbRef = useRef({ onClose, closable });
  useEffect(() => {
    cbRef.current = { onClose, closable };
  });

  useEffect(() => {
    if (!open) return;

    const token = pushOverlay();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // CHỈ lớp trên cùng được trả lời Esc. Lớp dưới vẫn đang nghe (listener của nó chưa gỡ), nên
      // phải tự kiểm tra ở đây — không có cách nào "tạm tắt" một listener đã gắn.
      if (!isTopOverlay(token)) return;
      // `closable` gác Ở ĐÂY chứ không ở nơi gọi: Esc là lối đóng KHÔNG có gì trên màn hình nhắc tới
      // nó, nên nơi gọi rất dễ chỉ nghĩ tới nút X mà quên phím này.
      if (cbRef.current.closable) cbRef.current.onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      popOverlay(token);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const toneStyle = tone !== "default" ? statusStyles[tone] : null;
  const showBadge = Boolean(icon || toneStyle);
  const badgeClass = toneStyle ? toneStyle.softPill : "bg-stroke-soft text-ink-2";
  const ToneIcon = toneStyle?.Icon;
  const fixedHeightClass = fixedHeight === true ? "h-[calc(100vh-3rem)]" : fixedHeight === false ? "" : fixedHeight;

  // Portal ra <body>: Modal hay được mở từ trigger nằm TRONG Card (hover:-translate-y
  // của Card tạo containing block mới lúc :hover) — không portal thì `fixed` bị nhốt
  // trong khung Card thay vì full viewport. Cùng lý do FloatingLayer đã portal.
  return createPortal(
    /* `dsvh-modal` + `dsvh-modal-scrim`: móc để CSS nhận ra lớp CHỒNG (xem `dsvh-tokens.css`).
       Làm bằng CSS chứ không bằng state độ sâu — state phải đợi effect chạy xong mới biết mình
       ở lớp mấy, tức có một khung hình vẽ sai màn mờ rồi mới sửa. Chọn tử anh-em (`~`) thì trình
       duyệt tự biết ngay từ khung đầu, và tự đúng lại khi một lớp đóng. */
    <div className="dsvh-modal fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="dsvh-modal-scrim fixed inset-0 bg-ink/30 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
        onClick={closable ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Header/footer CỐ ĐỊNH, chỉ phần nội dung giữa cuộn — trước đây cả 3 khối nằm chung MỘT
          `overflow-y-auto`, nên form dài (vd dialog Thêm mẫu) đẩy vùng Lưu/Hủy trôi theo scroll, có
          lúc bị cắt nửa dưới viewport (bắt được thật, user chụp màn hình). `min-h-0` trên khối nội
          dung là bắt buộc — thiếu nó thì flex item không chịu co lại để `overflow-y-auto` có tác dụng. */}
      <div
        className={`relative z-10 flex w-full flex-col overflow-hidden rounded-2xl border border-stroke-soft bg-surface shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 max-h-[calc(100vh-3rem)] sm:w-auto ${fixedHeightClass} ${sizeClasses[size]}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex shrink-0 flex-col gap-2.5 p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              {showBadge && (
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl ${badgeClass}`}
                >
                  {icon ?? (ToneIcon ? <ToneIcon size={20} /> : null)}
                </span>
              )}
              {title && (
                <h2 className="min-w-0 text-title font-semibold leading-snug text-ink">
                  {title}
                </h2>
              )}
            </div>
            {/* ẨN HẲN, không phải `disabled`: một nút X xám vẫn là một cái nút, người dùng vẫn bấm.
                Không có nút thì câu trả lời rõ ràng — lúc này chưa đóng được. */}
            {closable && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-lg p-1.5 text-ink-2 transition-colors hover:bg-stroke-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30"
                aria-label="Close modal"
              >
                <CloseIcon size={18} />
              </button>
            )}
          </div>
          {description && (
            <p className="text-body leading-relaxed text-ink-2">{description}</p>
          )}
        </div>

        {children && (
          <div className={`min-h-0 flex-1 overflow-y-auto px-6 text-body leading-relaxed text-ink ${footer ? "pb-4" : "pb-6"}`}>
            {children}
          </div>
        )}

        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-stroke-soft px-6 pb-6 pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
