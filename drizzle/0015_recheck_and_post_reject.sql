CREATE TYPE "public"."recheck_status" AS ENUM('none', 'pending', 'passed', 'failed');--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "recheck_status" "recheck_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "recheck_note" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "post_rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "post_reject_note" text;