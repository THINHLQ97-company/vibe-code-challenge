CREATE TYPE "public"."appeal_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."board" AS ENUM('ky_thuat', 'van_phong');--> statement-breakpoint
CREATE TYPE "public"."branch" AS ENUM('A', 'B');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('pending', 'needs_fix', 'approved');--> statement-breakpoint
CREATE TYPE "public"."registration_status" AS ENUM('pending', 'approved', 'returned');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('candidate', 'judge', 'admin');--> statement-breakpoint
CREATE TYPE "public"."score_source" AS ENUM('external_ai', 'judge');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "appeals" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"criteria" text NOT NULL,
	"evidence_url" text NOT NULL,
	"status" "appeal_status" DEFAULT 'pending' NOT NULL,
	"resolution_note" text,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "experience_surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "experience_surveys_submission_id_unique" UNIQUE("submission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "idea_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"module_scores" jsonb NOT NULL,
	"summary" text,
	"source" "score_source" DEFAULT 'external_ai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"module_scores" jsonb NOT NULL,
	"summary" text,
	"btc_feedback" text,
	"feedback_status" "feedback_status" DEFAULT 'pending' NOT NULL,
	"kpi3p_flag" boolean DEFAULT false NOT NULL,
	"source" "score_source" DEFAULT 'external_ai' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seasons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"cap_per_week" integer DEFAULT 35 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"season_id" integer NOT NULL,
	"product_name" text NOT NULL,
	"branch" "branch" NOT NULL,
	"topic_group" text NOT NULL,
	"problem_desc" text NOT NULL,
	"target_users" text NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"database_plan" text NOT NULL,
	"has_workflow" boolean DEFAULT false NOT NULL,
	"workflow_desc" text,
	"deploy_method" text NOT NULL,
	"is_prebuilt_repo" boolean DEFAULT false NOT NULL,
	"ai_tool" text,
	"google_ai_pro" boolean DEFAULT false NOT NULL,
	"data_used" text,
	"risk_self_assessment" text,
	"confirm_fake_data" boolean DEFAULT false NOT NULL,
	"confirm_no_matbao_info" boolean DEFAULT false NOT NULL,
	"confirm_template_consent" boolean DEFAULT false NOT NULL,
	"registration_status" "registration_status" DEFAULT 'pending' NOT NULL,
	"registration_note" text,
	"approved_at" timestamp,
	"submission_deadline" timestamp,
	"current_phase" integer DEFAULT 1 NOT NULL,
	"vibehost_url" text,
	"github_repo_url" text,
	"github_verified_at" timestamp,
	"facebook_post_url" text,
	"facebook_approved_at" timestamp,
	"engagement_count" integer,
	"engagement_tier" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"password_hash" text NOT NULL,
	"employee_code" text,
	"department" text,
	"board" "board",
	"role" "role" DEFAULT 'candidate' NOT NULL,
	"oauth_provider" text,
	"oauth_subject" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appeals" ADD CONSTRAINT "appeals_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "appeals" ADD CONSTRAINT "appeals_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "experience_surveys" ADD CONSTRAINT "experience_surveys_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idea_scores" ADD CONSTRAINT "idea_scores_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_scores" ADD CONSTRAINT "product_scores_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submissions" ADD CONSTRAINT "submissions_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
