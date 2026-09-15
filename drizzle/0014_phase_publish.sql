ALTER TABLE "submissions" ADD COLUMN "phase1_published_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "phase2_published_at" timestamp;--> statement-breakpoint
-- Bài ĐÃ công bố kết quả cuối thì hiển nhiên đã gửi điểm cả hai phase — lấp ngược cho chúng, nếu
-- không thì sau khi lên bản mới, thí sinh đã nhận kết quả bỗng thấy điểm từng phần biến mất.
UPDATE "submissions"
SET "phase1_published_at" = "published_at",
    "phase2_published_at" = "published_at"
WHERE "published_at" IS NOT NULL
  AND "phase1_published_at" IS NULL;
