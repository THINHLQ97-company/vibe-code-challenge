-- Mã phòng ban Kinh doanh thống nhất về "BZ" theo mã chuẩn của công ty.
--
-- Trước đây cùng một phòng ban mang ba mã khác nhau tuỳ chỗ: "SALES" trong schema và dữ liệu,
-- "KD" trên trang giới thiệu, còn mã công ty thật là "BZ". Đổi trong mã nguồn thôi thì chưa đủ —
-- những tài khoản đã tạo vẫn giữ chuỗi "SALES" trong cột department và sẽ lệch mãi.
--
-- Chạy lại nhiều lần vô hại: lần sau không còn hàng nào khớp điều kiện WHERE.
UPDATE "users" SET "department" = 'BZ' WHERE "department" = 'SALES';
