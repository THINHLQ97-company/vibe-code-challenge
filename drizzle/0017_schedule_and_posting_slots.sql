CREATE TYPE "public"."posting_period" AS ENUM('sang', 'chieu', 'toi');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posting_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"wave_id" integer NOT NULL,
	"day_index" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"period" "posting_period" NOT NULL,
	"capacity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "posting_slots_wave_day_period" UNIQUE("wave_id","day_index","period")
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "posting_slot_id" integer;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "posting_slot_booked_at" timestamp;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "phase2_opens_at" timestamp;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "phase2_closes_at" timestamp;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "judging_dates" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "posting_opens_at" timestamp;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "posting_closes_at" timestamp;--> statement-breakpoint
ALTER TABLE "waves" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posting_slots" ADD CONSTRAINT "posting_slots_wave_id_waves_id_fk" FOREIGN KEY ("wave_id") REFERENCES "public"."waves"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_posting_slot_id_posting_slots_id_fk" FOREIGN KEY ("posting_slot_id") REFERENCES "public"."posting_slots"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
