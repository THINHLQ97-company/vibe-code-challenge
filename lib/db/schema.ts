import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["candidate", "judge", "admin"]);
export const boardEnum = pgEnum("board", ["ky_thuat", "van_phong"]);
export const branchEnum = pgEnum("branch", ["A", "B"]);
export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "approved",
  "returned",
]);
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "pending",
  "needs_fix",
  "approved",
]);
export const appealStatusEnum = pgEnum("appeal_status", [
  "pending",
  "accepted",
  "rejected",
]);
export const scoreSourceEnum = pgEnum("score_source", ["external_ai", "judge"]);
export const securityStatusEnum = pgEnum("security_status", [
  "pending",
  "clean",
  "flagged",
]);

// Phòng ban → tự xếp bảng thi theo thể lệ mục Q
export const departmentToBoard: Record<string, "ky_thuat" | "van_phong"> = {
  TS: "ky_thuat",
  DE: "ky_thuat",
  OP: "van_phong",
  MK: "van_phong",
  FI: "van_phong",
  HR: "van_phong",
  SALES: "van_phong",
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  employeeCode: text("employee_code"),
  department: text("department"), // TS, DE, OP, MK, FI, HR, SALES
  board: boardEnum("board"),
  role: roleEnum("role").notNull().default("candidate"),
  oauthProvider: text("oauth_provider"),
  oauthSubject: text("oauth_subject"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  capPerWeek: integer("cap_per_week").notNull().default(35),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id),

  // Phần 2 — Đề tài (thể lệ mục Q)
  productName: text("product_name").notNull(),
  branch: branchEnum("branch").notNull(),
  topicGroup: text("topic_group").notNull(),
  problemDesc: text("problem_desc").notNull(),
  targetUsers: text("target_users").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),

  // Phần 3 — Kỹ thuật & an toàn
  databasePlan: text("database_plan").notNull(),
  hasWorkflow: boolean("has_workflow").notNull().default(false),
  workflowDesc: text("workflow_desc"),
  deployMethod: text("deploy_method").notNull(), // tự dựng mới / deploy từ repo có sẵn / ...
  isPrebuiltRepo: boolean("is_prebuilt_repo").notNull().default(false), // trần 50% điểm kỹ thuật nếu true
  aiTool: text("ai_tool"),
  googleAiPro: boolean("google_ai_pro").notNull().default(false),
  dataUsed: text("data_used"),
  riskSelfAssessment: text("risk_self_assessment"),

  // Cam kết (checkbox thể lệ mục Q11/17/18/19)
  confirmFakeData: boolean("confirm_fake_data").notNull().default(false),
  confirmNoMatbaoInfo: boolean("confirm_no_matbao_info").notNull().default(false),
  confirmTemplateConsent: boolean("confirm_template_consent").notNull().default(false),

  // CP2 — duyệt cuốn chiếu
  registrationStatus: registrationStatusEnum("registration_status")
    .notNull()
    .default("pending"),
  registrationNote: text("registration_note"),
  requestedDeadlineDays: integer("requested_deadline_days").notNull().default(15),
  approvedAt: timestamp("approved_at"),
  submissionDeadline: timestamp("submission_deadline"),

  // 3-phase chấm điểm
  currentPhase: integer("current_phase").notNull().default(1),

  // Phase 2 — sản phẩm & mã nguồn
  vibehostUrl: text("vibehost_url"),
  githubRepoUrl: text("github_repo_url"),
  githubVerifiedAt: timestamp("github_verified_at"),
  // Lưu lại lý do lần verify gần nhất thất bại — tham khảo pattern "validation status
  // pending/valid/warning" của hackclub/podium: lỗi phải sống sót qua reload, cả thí
  // sinh lẫn BTC/BGK đều cần thấy tại sao bài đang kẹt, không chỉ hiện tạm trên UI lúc bấm nút.
  githubVerifyError: text("github_verify_error"),
  githubLastCheckedAt: timestamp("github_last_checked_at"),

  // CP4 — cổng rà soát an toàn (7 điều cấm), điền từ hệ chấm ngoài hoặc admin
  securityStatus: securityStatusEnum("security_status").notNull().default("pending"),
  securityNote: text("security_note"),

  // Phase 3 — lan tỏa
  facebookPostUrl: text("facebook_post_url"),
  facebookApprovedAt: timestamp("facebook_approved_at"),
  engagementCount: integer("engagement_count"),
  engagementTier: integer("engagement_tier"), // 1-4

  // CP6
  surveySubmittedAt: timestamp("survey_submitted_at"),

  // Công bố
  finalScore: integer("final_score"),
  publishedAt: timestamp("published_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ideaScores = pgTable("idea_scores", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => submissions.id),
  moduleScores: jsonb("module_scores").$type<Record<string, number>>().notNull(), // { giaTriUngDung: number, ... }
  summary: text("summary"),
  source: scoreSourceEnum("source").notNull().default("external_ai"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productScores = pgTable("product_scores", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => submissions.id),
  moduleScores: jsonb("module_scores").$type<Record<string, number>>().notNull(), // { chatLuongKyThuat: number, hoanThien: number }
  summary: text("summary"),
  btcFeedback: text("btc_feedback"),
  feedbackStatus: feedbackStatusEnum("feedback_status").notNull().default("pending"),
  kpi3pFlag: boolean("kpi3p_flag").notNull().default(false),
  source: scoreSourceEnum("source").notNull().default("external_ai"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appeals = pgTable("appeals", {
  id: serial("id").primaryKey(),
  submissionId: integer("submission_id")
    .notNull()
    .references(() => submissions.id),
  criteria: text("criteria").notNull(),
  evidenceUrl: text("evidence_url").notNull(),
  status: appealStatusEnum("status").notNull().default("pending"),
  resolutionNote: text("resolution_note"),
  resolvedBy: integer("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const experienceSurveys = pgTable(
  "experience_surveys",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissions.id),
    answers: jsonb("answers").$type<{ common: string[]; boardSpecific: string[] }>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique().on(table.submissionId)]
);

export const usersRelations = relations(users, ({ many }) => ({
  submissions: many(submissions),
}));

export const seasonsRelations = relations(seasons, ({ many }) => ({
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  season: one(seasons, { fields: [submissions.seasonId], references: [seasons.id] }),
  ideaScores: many(ideaScores),
  productScores: many(productScores),
  appeals: many(appeals),
  experienceSurvey: many(experienceSurveys),
}));

export const ideaScoresRelations = relations(ideaScores, ({ one }) => ({
  submission: one(submissions, {
    fields: [ideaScores.submissionId],
    references: [submissions.id],
  }),
}));

export const productScoresRelations = relations(productScores, ({ one }) => ({
  submission: one(submissions, {
    fields: [productScores.submissionId],
    references: [submissions.id],
  }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  submission: one(submissions, {
    fields: [appeals.submissionId],
    references: [submissions.id],
  }),
  resolver: one(users, { fields: [appeals.resolvedBy], references: [users.id] }),
}));

export const experienceSurveysRelations = relations(experienceSurveys, ({ one }) => ({
  submission: one(submissions, {
    fields: [experienceSurveys.submissionId],
    references: [submissions.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type IdeaScore = typeof ideaScores.$inferSelect;
export type ProductScore = typeof productScores.$inferSelect;
export type Appeal = typeof appeals.$inferSelect;
export type ExperienceSurvey = typeof experienceSurveys.$inferSelect;
