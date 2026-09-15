ALTER TABLE "submissions" ADD COLUMN "phase2_submitted_at" timestamp;--> statement-breakpoint

-- Bài đã nộp từ trước không có mốc này. Lấy mốc xác minh mã nguồn nếu có, không thì lấy lần sửa
-- gần nhất — cả hai đều xấp xỉ đúng thời điểm nộp, và có một mốc xấp xỉ vẫn hơn để trống rồi xếp
-- những người đó xuống cuối hàng vì một lý do không liên quan gì tới họ.
UPDATE submissions
SET phase2_submitted_at = COALESCE(github_verified_at, updated_at)
WHERE phase2_submitted_at IS NULL AND vibehost_url IS NOT NULL;
