ALTER TABLE "submissions" ALTER COLUMN "final_score" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "idea_scores" ADD COLUMN "judge_id" integer;--> statement-breakpoint
ALTER TABLE "product_scores" ADD COLUMN "judge_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "idea_scores" ADD CONSTRAINT "idea_scores_judge_id_users_id_fk" FOREIGN KEY ("judge_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_scores" ADD CONSTRAINT "product_scores_judge_id_users_id_fk" FOREIGN KEY ("judge_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "idea_scores" ADD CONSTRAINT "idea_scores_submission_judge_uq" UNIQUE("submission_id","judge_id");--> statement-breakpoint
ALTER TABLE "product_scores" ADD CONSTRAINT "product_scores_submission_judge_uq" UNIQUE("submission_id","judge_id");