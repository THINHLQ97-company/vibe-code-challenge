/**
 * SỔ ĐĂNG KÝ LỚP PHỦ — ai đang ở trên cùng, và ai được trả lời phím Esc.
 *
 * ── VÌ SAO PHẢI CÓ ────────────────────────────────────────────────────────────────────────────
 *
 * Trước 05/09/2026 mỗi lớp phủ tự gắn một listener `keydown` lên `window` rồi đóng chính mình khi
 * thấy Esc, không ai hỏi "mình có phải lớp trên cùng không". Hai lớp mở ⇒ hai listener ⇒ MỘT lần
 * Esc đóng CẢ HAI. Bắt được ở luồng tên miền: wizard Thêm tên miền mở từ trong hộp thoại Quản lý
 * tên miền, gõ nhầm Esc là mất trắng hai lớp, rơi thẳng về trang dự án.
 *
 * Không có cách nào "tạm tắt" một listener đã gắn, nên phép kiểm phải nằm TRONG handler — và để
 * kiểm được thì phải có một chỗ duy nhất biết thứ tự các lớp. Đó là tệp này.
 *
 * ── VÌ SAO LÀ BIẾN CẤP MÔ-ĐUN, KHÔNG PHẢI CONTEXT ─────────────────────────────────────────────
 *
 * Thứ tự chồng lớp là sự thật của CẢ TRANG, không của một cây React: `Modal` portal thẳng ra
 * `<body>`, nên hai lớp có thể nằm ở hai nhánh cây hoàn toàn tách biệt và không nhánh nào là cha
 * của nhánh kia. Một context chỉ phủ được nhánh của nó.
 *
 * ── VÌ SAO DÙNG OBJECT RỖNG LÀM DANH TÍNH ─────────────────────────────────────────────────────
 *
 * Không dùng số đếm: lớp đóng KHÔNG theo thứ tự (component cha tháo lớp dưới trong khi lớp trên còn
 * mở — ca thật khi router điều hướng lúc đang mở hai lớp) thì mọi chỉ số phía sau trôi đi một bậc.
 * Tham chiếu object thì luôn tìm đúng phần tử của mình bằng `indexOf`, đóng thứ tự nào cũng đúng.
 */

export type OverlayToken = { readonly __overlay: unique symbol } | object;

const stack: object[] = [];

/**
 * KHOÁ CUỘN NỀN do LỚP ĐẦU TIÊN quản, không phải mỗi lớp tự lưu-tự trả.
 *
 * Bản trước mỗi modal tự nhớ `originalOverflow` của riêng nó. Đóng đúng thứ tự LIFO thì vẫn ra kết
 * quả đúng, nhưng chỉ cần MỘT lần đóng trái thứ tự là lớp dưới trả `overflow` về giá trị cũ trong
 * khi lớp trên vẫn đang hiển thị — trang nền cuộn được sau lưng hộp thoại.
 */
let savedOverflow: string | null = null;

/** Đẩy một lớp lên đỉnh. Trả về `token` để nơi gọi giữ và dùng lúc gỡ. */
export function pushOverlay(): object {
  const token = {};
  stack.push(token);
  if (stack.length === 1 && typeof document !== "undefined") {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  return token;
}

/** Gỡ một lớp — ở BẤT KỲ vị trí nào trong sổ, không bắt buộc phải là đỉnh. */
export function popOverlay(token: object): void {
  const i = stack.indexOf(token);
  if (i >= 0) stack.splice(i, 1);
  if (stack.length === 0 && savedOverflow !== null && typeof document !== "undefined") {
    document.body.style.overflow = savedOverflow;
    savedOverflow = null;
  }
}

/** `token` có đang ở đỉnh không — điều kiện DUY NHẤT để một lớp được trả lời Esc. */
export function isTopOverlay(token: object): boolean {
  return stack.length > 0 && stack[stack.length - 1] === token;
}

/** Số lớp đang mở. Dùng cho phép kiểm; mã sản phẩm không cần biết. */
export function overlayDepth(): number {
  return stack.length;
}

/** Dọn sạch — CHỈ dùng trong phép kiểm, để mỗi ca bắt đầu từ sổ rỗng. */
export function __resetOverlayStackForTests(): void {
  stack.length = 0;
  savedOverflow = null;
}
