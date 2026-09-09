ALTER TABLE "submissions" ADD COLUMN "github_verify_error" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "github_last_checked_at" timestamp;