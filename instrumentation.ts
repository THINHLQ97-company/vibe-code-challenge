/**
 * Next gọi `register()` một lần cho mỗi tiến trình server, trước khi phục vụ request đầu tiên —
 * đúng chỗ để chuẩn bị database. Đặt ở đây thay vì trong một route vì nó phải chạy dù request đầu
 * tiên rơi vào trang nào.
 *
 * Nhánh phải viết dạng `=== "nodejs"` BÊN TRONG if, không được viết `!== "nodejs"` rồi return sớm.
 * Dự án có middleware nên Next biên dịch file này cho cả edge runtime; ở bản edge webpack thay
 * `process.env.NEXT_RUNTIME` thành "edge" rồi xoá cả khối if trước khi phân giải module. Viết kiểu
 * return sớm thì lệnh import nằm ngoài if, webpack vẫn phân giải nó và build gãy ở
 * `postgres` → `crypto` (module Node không tồn tại trên edge).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureBootstrapped } = await import("./lib/db/bootstrap");
    await ensureBootstrapped();
  }
}
