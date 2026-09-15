ALTER TABLE "submissions" ADD COLUMN "phase3_checklist_acked_at" timestamp;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "phase3_checklist_version" text;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "phase3_checklist_items" jsonb DEFAULT '[]'::jsonb NOT NULL;