-- ĐỢT 0 — chỗ chứa những bài đã đăng ký TRƯỚC khi có cơ chế đợt thi.
--
-- Không có đợt này thì các bài cũ mang `wave_id` rỗng, và chúng rơi vào nhánh dự phòng ở ba chỗ
-- (cổng duyệt theo trần tuần, trung vị lan tỏa theo tuần lịch, bảng điểm theo tuần) — tức hệ thống
-- chạy song song hai luật cho hai nhóm thí sinh. Gom hết về một đợt là chỉ còn một luật.
--
-- Ba lựa chọn có chủ ý:
--   · `order_index = 0` để nó luôn đứng đầu danh sách, trước Đợt 1.
--   · `bonus_points = 0`. Đây là đợt gom dữ liệu cũ, không phải phần thưởng cho ai đăng ký sớm;
--     cộng điểm ở đây là tự dưng đổi điểm của những bài đã chấm xong. BTC sửa được trong giao diện
--     nếu muốn khác.
--   · `status = 'draft'` để KHÔNG hiện trên trang giới thiệu. Nó vẫn hiện đủ trong khu quản trị,
--     nhưng công bố ra ngoài như một đợt thật thì thí sinh sẽ hỏi vì sao mình lỡ mất một đợt.
--
-- Chạy lại nhiều lần vô hại: `NOT EXISTS` chặn tạo trùng, và `wave_id IS NULL` chặn gán lại.
INSERT INTO "waves" (
  "season_id", "name", "order_index",
  "registration_opens_at", "registration_closes_at",
  "capacity", "bonus_points", "status"
)
SELECT
  s."id", 'Đợt 0', 0,
  s."start_date", now(),
  -- Trần đặt rộng để đợt gom này không bao giờ báo "đã đầy" và chặn BTC duyệt bài cũ.
  500, 0, 'draft'
FROM "seasons" s
WHERE NOT EXISTS (
  SELECT 1 FROM "waves" w WHERE w."season_id" = s."id" AND w."order_index" = 0
);
--> statement-breakpoint
UPDATE "submissions" sub
SET "wave_id" = (
  SELECT w."id" FROM "waves" w
  WHERE w."season_id" = sub."season_id" AND w."order_index" = 0
  LIMIT 1
)
WHERE sub."wave_id" IS NULL;
