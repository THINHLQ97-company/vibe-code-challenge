ALTER TABLE "waves" ADD COLUMN "capacity_ky_thuat" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "capacity_van_phong" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
-- Chia đôi trần hiện có cho hai bảng, giữ nguyên TỔNG. Chia đôi là phỏng đoán — BTC chỉnh lại
-- theo tỉ lệ nhân sự thật trong giao diện quản lý đợt thi.
UPDATE "waves"
SET "capacity_ky_thuat"  = "capacity" / 2,
    "capacity_van_phong" = "capacity" - ("capacity" / 2);
