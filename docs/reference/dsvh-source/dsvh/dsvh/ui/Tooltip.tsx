"use client";

import { cloneElement, isValidElement, useId, useRef, useState, type ReactNode } from "react";

import { FloatingLayer } from "@/components/dsvh/ui/overlay/FloatingLayer";

type Side = "top" | "bottom" | "left" | "right";

/**
 * Nhãn hiện khi rê chuột / focus bàn phím.
 *
 * Dựng trên `FloatingLayer` (portal ra `document.body`) chứ KHÔNG phải `absolute` trong luồng.
 * Bản CSS-thuần trước đây bị CẮT bởi bất kỳ tổ tiên nào có `overflow-hidden` — bắt được thật ở
 * sidebar ngày 05/08: nút thu gọn nằm trong `<aside overflow-hidden>` (cần cho hiệu ứng co bề
 * rộng) nên tooltip không bao giờ hiện ra được. Portal thoát khỏi mọi clip, cùng cách mà
 * `DropdownMenu`/`Popover` đã dùng.
 *
 * Chỉ hiện khi CÓ `content` — nơi gọi truyền chuỗi rỗng thì coi như không có tooltip.
 */
export function Tooltip({
  content,
  side = "top",
  children,
}: {
  content: ReactNode;
  side?: Side;
  children: ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  /**
   * MÀN CẢM ỨNG: `hover` không tồn tại, và `focus` trên iOS/Android chỉ đôi khi phát khi chạm —
   * nên nếu chỉ nghe hover/focus thì người dùng điện thoại đọc được hay không là chuyện hên xui.
   * Thêm 20/08/2026 sau khi codex nêu đúng điểm này lúc rà `CardHeader.hint`: từ nay chú thích có
   * thể là cả một đoạn nội dung bổ trợ, không còn là một nhãn ngắn thừa-thì-đọc như trước.
   *
   * `pointerType === "mouse"` bị BỎ QUA: chuột đã có hover lo, thêm toggle nữa thì một cú bấm
   * thường (vd bấm để mở tooltip rồi bấm tiếp) lại đóng mất thứ hover đang giữ.
   *
   * Đóng thì đã có sẵn: `FloatingLayer` tự đóng khi Esc, bấm ra ngoài, cuộn hoặc đổi cỡ màn.
   */
  const chamManHinh = (e: { pointerType?: string }) => {
    if (e.pointerType === "mouse") return;
    setOpen((v) => !v);
  };
  return (
    <>
      <span
        ref={ref}
        className="inline-flex"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocusCapture={() => setOpen(true)}
        onBlurCapture={() => setOpen(false)}
        onPointerUp={chamManHinh}
      >
        {/* `aria-describedby` gắn vào CHÍNH phần tử nhận tiêu điểm, không gắn vào lớp bọc: lớp bọc
            không focus được nên trình đọc màn hình không bao giờ đọc tới. Chỉ trỏ khi tooltip đang
            mở — trỏ tới một id chưa tồn tại thì một số trình đọc báo lỗi và bỏ qua cả thuộc tính. */}
        {isValidElement(children)
          ? cloneElement(children as React.ReactElement<{ "aria-describedby"?: string }>, {
              "aria-describedby": open ? id : undefined,
            })
          : children}
      </span>
      {content ? (
        <FloatingLayer
          anchorRef={ref}
          open={open}
          onClose={() => setOpen(false)}
          side={side}
          align="center"
          gap={8}
          id={id}
          role="tooltip"
          /**
           * `text-surface`, KHÔNG phải `text-white` (13/08/2026).
           *
           * `ink` là token CHỮ nên nó ĐẢO giữa hai theme: sáng `#001d21` (rất tối), tối `#eef1f2`
           * (rất sáng). Dùng nó làm NỀN thì nền tự đảo theo theme — đúng ý đồ "khối lật màu" — nhưng
           * chữ lại ghim cứng `#ffffff`. Đo pixel: theme sáng 17.53:1, theme tối **1.14:1** — trắng
           * trên gần-trắng, chú giải biến mất hoàn toàn.
           *
           * `surface` là cặp đối xứng của `ink` (sáng `#ffffff`, tối `#1a1b23`) nên đảo CÙNG NHỊP:
           * 17.53:1 và 15.10:1. Luật chung: nền dùng token đảo thì chữ cũng phải là token đảo — ghim
           * một màu tuyệt đối vào một cặp lật là chắc chắn hỏng một trong hai theme.
           */
          /* `max-w-xs` + cho phép xuống dòng — thêm 20/08/2026. Trước đây mọi nơi gọi chỉ truyền câu
             ngắn nên không ai gặp; từ khi `CardHeader` có `hint`, nội dung có thể là cả một đoạn và
             tooltip kéo thành MỘT dòng dài 1090px, tràn qua cả thanh bên. Trần bề ngang thuộc về
             component chứ không phải nơi gọi: bắt mỗi chỗ tự nhớ đặt `max-w-*` là cách để chỗ thứ
             hai quên. */
          className="pointer-events-none max-w-xs whitespace-normal break-words rounded-lg bg-ink px-2.5 py-1.5 text-caption font-medium text-surface shadow-lg"
        >
          {content}
        </FloatingLayer>
      ) : null}
    </>
  );
}
