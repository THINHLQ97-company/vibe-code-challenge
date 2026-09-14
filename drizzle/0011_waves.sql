CREATE TYPE "public"."wave_status" AS ENUM('draft', 'open', 'closed');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "waves" (
	"id" serial PRIMARY KEY NOT NULL,
	"season_id" integer NOT NULL,
	"name" text NOT NULL,
	"order_index" integer NOT NULL,
	"registration_opens_at" timestamp NOT NULL,
	"registration_closes_at" timestamp NOT NULL,
	"capacity" integer DEFAULT 35 NOT NULL,
	"bonus_points" integer DEFAULT 0 NOT NULL,
	"status" "wave_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "wave_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "waves" ADD CONSTRAINT "waves_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_wave_id_waves_id_fk" FOREIGN KEY ("wave_id") REFERENCES "public"."waves"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
