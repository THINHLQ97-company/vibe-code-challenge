ALTER TABLE "submissions" ADD COLUMN "btc_feedback" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "feedback_status" "feedback_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "kpi3p_flag" boolean DEFAULT false NOT NULL;--> statement-breakpoint
--> Chuyển dữ liệu cũ lên cấp bài dự thi TRƯỚC khi bỏ cột, nếu không phản hồi Phase 2 và cờ KPI
--> của các bài đã chấm sẽ mất trắng. Lấy theo phiếu mới nhất có ghi phản hồi.
UPDATE "submissions" s SET
  "btc_feedback" = p."btc_feedback",
  "feedback_status" = p."feedback_status",
  "kpi3p_flag" = p."kpi3p_flag"
FROM (
  SELECT DISTINCT ON ("submission_id") "submission_id", "btc_feedback", "feedback_status", "kpi3p_flag"
  FROM "product_scores"
  ORDER BY "submission_id", ("btc_feedback" IS NOT NULL) DESC, "created_at" DESC
) p
WHERE p."submission_id" = s."id";--> statement-breakpoint
ALTER TABLE "product_scores" DROP COLUMN IF EXISTS "btc_feedback";--> statement-breakpoint
ALTER TABLE "product_scores" DROP COLUMN IF EXISTS "feedback_status";--> statement-breakpoint
ALTER TABLE "product_scores" DROP COLUMN IF EXISTS "kpi3p_flag";