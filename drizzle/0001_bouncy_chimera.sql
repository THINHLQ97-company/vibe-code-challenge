CREATE TYPE "public"."security_status" AS ENUM('pending', 'clean', 'flagged');--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "requested_deadline_days" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "security_status" "security_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "security_note" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "survey_submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "final_score" integer;