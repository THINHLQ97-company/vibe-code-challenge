import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  real,
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
export const recheckStatusEnum = pgEnum("recheck_status", [
  "none",
  "pending",
  "passed",
  "failed",
]);
export const waveStatusEnum = pgEnum("wave_status", ["draft", "open", "closed"]);
export const postingPeriodEnum = pgEnum("posting_period", ["sang", "chieu", "toi"]);
export const scoreSourceEnum = pgEnum("score_source", ["external_ai", "judge"]);
export const securityStatusEnum = pgEnum("security_status", [
  "pending",
  "clean",
  "flagged",
]);

// Phòng ban → tự xếp bảng thi theo thể lệ mục Q
/**
 * Phòng ban → bảng thi (thể lệ mục Q).
 *
 * Danh sách mã bám theo phòng ban THẬT trên Odoo (24 mục, chốt 14/09/2026) — xem `lib/department.ts`.
 * Bảng Kỹ thuật tách làm bốn team theo yêu cầu BTC; Chăm sóc khách hàng và các nhóm Tư vấn gộp vào
 * BZ vì cùng khối kinh doanh. Administration, BOD, Company và TE không thuộc diện dự thi nên không
 * có mã ở đây.
 */
export const departmentToBoard: Record<string, "ky_thuat" | "van_phong"> = {
  TS: "ky_thuat",
  AI: "ky_thuat",
  DE: "ky_thuat",
  SA: "ky_thuat",
  OP: "van_phong",
  MK: "van_phong",
  FI: "van_phong",
  HR: "van_phong",
  BZ: "van_phong",
  /**
   * Nhân sự không thuộc phòng chuyên môn nào (Administration, BOD, Company, TE). Vẫn dự thi bình
   * thường, xếp Bảng Văn phòng — chặn họ dự thi chỉ vì phòng ban của họ không nằm trong danh mục
   * là loại người muốn tham gia vì một lý do hành chính.
   */
  KHAC: "van_phong",
};

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  /**
   * CHO PHÉP RỖNG. Tài khoản đăng nhập bằng Microsoft không có mật khẩu nào cả — ép `NOT NULL` thì
   * phải bịa ra một chuỗi băm giả để ghi vào, mà chuỗi băm giả nằm trong bảng mật khẩu là thứ
   * không ai muốn phải giải thích về sau. Rỗng nghĩa là "tài khoản này không đăng nhập bằng mật
   * khẩu được", và `verifyPassword` phải tự hiểu như vậy.
   */
  passwordHash: text("password_hash"),
  employeeCode: text("employee_code"),
  department: text("department"), // TS, AI, DE, SA, OP, MK, FI, HR, BZ, KHAC
  /**
   * Chuỗi phòng ban THÔ do Microsoft Graph trả về (vd "Phòng Marketing", "Technical Support").
   * Giữ nguyên bản gốc bên cạnh mã đã quy đổi: khi một giá trị lạ không khớp bảng quy đổi, đây là
   * thứ duy nhất cho biết Graph thực sự trả về cái gì để bổ sung bảng — thiếu nó thì chỉ biết
   * "không map được" mà không biết không map được từ cái gì.
   */
  departmentRaw: text("department_raw"),
  board: boardEnum("board"),
  role: roleEnum("role").notNull().default("candidate"),
  /**
   * Ảnh đại diện lưu dạng data URI (image/jpeg base64) ngay trong DB cuộc thi.
   *
   * Không dựng ổ lưu trữ file riêng cho một tấm ảnh nhỏ: trình duyệt đã resize về ≤512px và nén
   * JPEG trước khi gửi nên mỗi ảnh chỉ vài chục KB. Khi chuyển sang đăng nhập MS365, Graph API có
   * endpoint `/me/photo/$value` — lúc đó nạp một lần vào đúng cột này, không phải đổi schema.
   */
  avatarUrl: text("avatar_url"),
  oauthProvider: text("oauth_provider"),
  oauthSubject: text("oauth_subject"),
  /**
   * Lần đăng nhập gần nhất. `null` = chưa đăng nhập lần nào — chính là cách phân biệt một giám
   * khảo được MỜI TRƯỚC (đã tạo bản ghi, chờ họ vào) với người đã thật sự dùng hệ thống.
   */
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Cấu hình vận hành bật/tắt được từ trang BTC, không cần deploy lại.
 *
 * Dạng khoá–giá trị chứ không phải mỗi thiết lập một cột: các công tắc này sinh ra theo nhu cầu
 * vận hành từng mùa thi, và thêm một công tắc mà phải chạy migration đổi bảng thì kiểu gì cũng có
 * lúc cần gấp mà không kịp. Giá trị luôn là chuỗi; `lib/settings.ts` lo phần ép kiểu và giá trị
 * mặc định để nơi gọi không phải tự đoán.
 */
export const appSettings = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: integer("updated_by"),
});

export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  capPerWeek: integer("cap_per_week").notNull().default(35),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * ĐỢT THI (wave) — đơn vị tổ chức thay cho "trần N đề tài duyệt mỗi tuần".
 *
 * Cơ chế cũ là một con số `capPerWeek` chạy theo tuần lịch, không ai điều khiển được: không dời
 * được ngày, không đóng sớm được, và thí sinh không có cách nào biết khi nào tới lượt mình. Wave
 * là đúng cơ chế đó nhưng BTC tự chọn ngày mở/đóng, và thí sinh nhìn thấy lịch.
 *
 * `orderIndex` quyết định ĐIỂM THƯỞNG đăng ký sớm, nên nó phải cố định ngay khi tạo wave: đổi thứ
 * tự về sau là đổi điểm của những người đã thi xong.
 */
export const waves = pgTable("waves", {
  id: serial("id").primaryKey(),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id),
  name: text("name").notNull(),
  /** 1, 2, 3… — thứ tự công bố, dùng để tính điểm thưởng. */
  orderIndex: integer("order_index").notNull(),
  registrationOpensAt: timestamp("registration_opens_at").notNull(),
  registrationClosesAt: timestamp("registration_closes_at").notNull(),
  /**
   * Trần số thí sinh, TÁCH RIÊNG hai bảng thi.
   *
   * Một con số chung thì một bảng có thể lấp gần hết đợt và bảng kia phải chờ đợt sau — mà giải
   * thưởng tuần trao theo từng bảng, nên một đợt lệch hẳn về một phía là một bảng gần như không
   * có ai để so. Hai con số cho phép BTC đặt đúng tỉ lệ nhân sự thật của công ty.
   *
   * `capacity` giữ lại làm TỔNG để không phải sửa mọi nơi đang đọc nó; hai cột dưới mới là thứ
   * cổng đăng ký thật sự kiểm.
   */
  capacity: integer("capacity").notNull().default(35),
  capacityKyThuat: integer("capacity_ky_thuat").notNull().default(15),
  capacityVanPhong: integer("capacity_van_phong").notNull().default(20),
  /**
   * Điểm thưởng cộng thêm cho người đăng ký ở wave này.
   *
   * Mặc định giảm dần 1 điểm mỗi wave, tối đa 5 (xem `lib/wave-bonus.ts`). Giảm về 0 chứ không đi
   * âm: đăng ký muộn thì KHÔNG được cộng, không bị phạt. Để thành cột trong bảng chứ không gõ
   * cứng trong mã vì BTC có thể muốn một wave nào đó khác lệ thường.
   */
  bonusPoints: integer("bonus_points").notNull().default(0),

  /**
   * ── LỊCH CỦA ĐỢT ───────────────────────────────────────────────────────────────────────────
   *
   * Cả năm mốc dưới đây đều CÓ THỂ RỖNG, vì đợt do ban tổ chức tự tạo trong giao diện quản lý có
   * thể chưa điền xong lịch. Mọi màn hình đọc chúng phải chịu được `null` chứ không được coi là
   * chắc chắn có — hiện một ngày sai còn tệ hơn không hiện ngày nào.
   */

  /** Ngày bắt đầu làm bài (Phase 2) — ngay sau khi đóng đăng ký. */
  phase2OpensAt: timestamp("phase2_opens_at"),
  /**
   * HẠN NỘP của cả đợt.
   *
   * Trước đây hạn nộp tính riêng cho từng người: ngày được duyệt cộng 15. Cách đó cho ra 40 hạn
   * nộp lệch nhau trong cùng một đợt, trong khi ban giám khảo chỉ chấm vào ba mốc cố định — nên
   * có người hết hạn sau lượt chấm cuối, không ai chấm kịp. Nay cả đợt chung một hạn, đúng theo
   * lịch đã công bố.
   */
  phase2ClosesAt: timestamp("phase2_closes_at"),
  /**
   * Các mốc ban giám khảo trả kết quả, dạng ["2026-09-26", ...].
   *
   * Lưu danh sách chứ không lưu "thứ Bảy hằng tuần": lịch thật của mùa 1 là hai lượt thứ Bảy cộng
   * một lượt vào đúng ngày đóng đợt, nên một quy tắc lặp theo tuần diễn đạt không nổi.
   */
  judgingDates: jsonb("judging_dates").$type<string[]>().notNull().default([]),
  /** Ngày đầu và ngày cuối của cửa sổ đăng bài Phase 3. */
  postingOpensAt: timestamp("posting_opens_at"),
  postingClosesAt: timestamp("posting_closes_at"),
  /** Ngày đợt khép lại — sau khi bài đăng cuối đếm đủ bảy ngày tương tác. */
  completedAt: timestamp("completed_at"),

  status: waveStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * KHUNG GIỜ ĐĂNG BÀI của Phase 3.
 *
 * Bài đăng lên nhóm cộng đồng phải qua ban tổ chức duyệt mới hiện. Nếu bốn mươi bài cùng chờ
 * duyệt trong một buổi thì chúng đè nhau trên bảng tin: bài lên trước được đọc, bài lên sau trôi
 * mất — và điểm lan tỏa so theo trung vị sẽ phản ánh thứ tự duyệt chứ không phản ánh chất lượng
 * bài. Chia sẵn hạn mức theo từng khung giờ là cách giữ cho mọi bài có cơ hội ngang nhau.
 *
 * Một hàng = một khung của một ngày trong một đợt.
 */
export const postingSlots = pgTable(
  "posting_slots",
  {
    id: serial("id").primaryKey(),
    waveId: integer("wave_id")
      .notNull()
      .references(() => waves.id),
    /** 1, 2, 3 — ngày thứ mấy trong cửa sổ đăng bài. */
    dayIndex: integer("day_index").notNull(),
    /** Mốc bắt đầu của khung, đã tính sẵn để sắp xếp và so với hiện tại mà không phải dựng lại. */
    startsAt: timestamp("starts_at").notNull(),
    period: postingPeriodEnum("period").notNull(),
    capacity: integer("capacity").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    // Một đợt chỉ có đúng một khung "sáng ngày 2". Khoá này là thứ khiến việc dựng lại khung giờ
    // sau khi ban tổ chức dời lịch trở thành cập nhật chứ không đẻ ra bản sao.
    waveDayPeriod: unique("posting_slots_wave_day_period").on(t.waveId, t.dayIndex, t.period),
  })
);

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id),
  /**
   * Đợt thi của bài này. CHO PHÉP RỖNG vì các bài tạo trước khi có cơ chế wave không thuộc đợt
   * nào — ép NOT NULL thì migration phải bịa một wave giả để nhét chúng vào.
   */
  waveId: integer("wave_id").references(() => waves.id),

  // Phần 2 — Đề tài (thể lệ mục Q)
  productName: text("product_name").notNull(),
  branch: branchEnum("branch").notNull(),
  topicGroup: text("topic_group").notNull(),
  problemDesc: text("problem_desc").notNull(),
  targetUsers: text("target_users").notNull(),
  /** Ngưng thu thập — ba chức năng chính nay nằm trong PRD. Giữ cột cho dữ liệu cũ. */
  features: jsonb("features").$type<string[]>().notNull().default([]),

  /**
   * PRD / tài liệu mô tả sản phẩm — ĐẦU VÀO CHÍNH của Phase 1 ("chấm điểm PRD và document").
   *
   * Lưu NỘI DUNG markdown chứ không lưu file nhị phân: hệ chấm điểm ngoài phải ĐỌC ĐƯỢC tài liệu
   * mới chấm được ý tưởng. Một file .docx trong ổ đĩa hay một link Google Docs private thì nó
   * không mở ra được, và Phase 1 sẽ không bao giờ chấm tự động được như thể lệ mô tả.
   * Thí sinh chọn file .md (đọc ngay ở trình duyệt) hoặc dán thẳng nội dung.
   */
  prdContent: text("prd_content"),
  prdFileName: text("prd_file_name"),

  /**
   * ── CÁC TRƯỜNG NGƯNG THU THẬP (từ 10/09/2026) ──────────────────────────────────────────────
   *
   * PRD nay là tài liệu bắt buộc và đã mô tả đầy đủ phạm vi, dữ liệu và cách làm. Hỏi lại những
   * điều đó trong form là bắt thí sinh khai hai lần cùng một nội dung, và hai bản khai lệch nhau
   * thì hội đồng không biết tin bản nào.
   *
   * GIỮ CỘT chứ không xoá: các mùa/bài trước đã có dữ liệu ở đây và màn BTC vẫn hiển thị nếu có.
   * Chỉ nới `database_plan` từ NOT NULL sang cho phép trống, vì bài mới không còn khai nữa.
   */
  databasePlan: text("database_plan"),
  hasWorkflow: boolean("has_workflow").notNull().default(false),
  workflowDesc: text("workflow_desc"),
  deployMethod: text("deploy_method").notNull(), // luôn là "Tự dựng mới trong kỳ thi" — xem dưới
  /**
   * BTC PHÁT HIỆN bài dùng repo/mẫu có sẵn ⇒ VI PHẠM, không qua được Phase 2.
   *
   * Đây là cuộc thi vibe code: giá trị nằm ở việc tự dựng trong kỳ thi. Bản trước cho thí sinh
   * TỰ KHAI "deploy từ repo có sẵn" rồi chỉ hạ trần điểm kỹ thuật xuống 20/40 — tức là vẫn hợp lệ,
   * chỉ thiệt điểm. Nay bỏ hẳn lựa chọn đó ở form đăng ký, và cột này đổi vai: do BTC gắn khi soi
   * mã nguồn thấy dùng lại repo cũ. Gắn cờ thì `feedbackStatus` không được duyệt đạt và không công
   * bố được (xem app/api/admin/submissions/[id]/prebuilt/route.ts).
   */
  isPrebuiltRepo: boolean("is_prebuilt_repo").notNull().default(false),
  prebuiltNote: text("prebuilt_note"),
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

  // Phản hồi Phase 2 là quyết định CHUNG của BTC về cả bài, không phải ý kiến riêng của một
  // giám khảo — để trên phiếu chấm thì mỗi phiếu mang một cờ KPI khác nhau và hệ HRM đọc
  // trúng phiếu nào nó bắt được trước.
  btcFeedback: text("btc_feedback"),
  feedbackStatus: feedbackStatusEnum("feedback_status").notNull().default("pending"),
  /**
   * Cờ cho hệ HRM đọc: bài đã đạt, được tính vào mục KPI **5.2 Đề xuất cải tiến / sáng kiến**.
   * App chỉ GẮN CỜ, không đẩy dữ liệu đi đâu — hệ HRM tự đọc.
   *
   * Tên cột giữ nguyên `kpi3p_flag` dù nhãn nghiệp vụ đã đổi: đổi tên cột kéo theo migration và mọi
   * chỗ đọc, trong khi ý nghĩa "cờ KPI của bài này" không đổi. Nhãn hiển thị nằm ở `lib/kpi.ts`.
   */
  kpi3pFlag: boolean("kpi3p_flag").notNull().default(false),

  // CP4 — cổng rà soát an toàn (7 điều cấm), điền từ hệ chấm ngoài hoặc admin
  securityStatus: securityStatusEnum("security_status").notNull().default("pending"),
  securityNote: text("security_note"),

  /**
   * VÒNG RÀ LẠI sau khi bài bị trả về ở Phase 2.
   *
   * Không phải chấm lại: điểm Phase 2 đã chốt ở lần chấm đầu. Vòng này chỉ trả lời một câu — bản
   * sửa đã đạt chuẩn để đi tiếp chưa. Cần cột riêng vì cổng API lọc bài theo "đã có điểm từ công
   * cụ ngoài chưa", nên bài đã chấm một lần thì biến mất khỏi hàng đợi vĩnh viễn; sửa xong nộp lại
   * thì công cụ chạy bao nhiêu lần cũng không thấy nữa.
   */
  recheckStatus: recheckStatusEnum("recheck_status").notNull().default("none"),
  recheckNote: text("recheck_note"),

  // Phase 3 — lan tỏa
  /**
   * XÁC NHẬN CHECKLIST trước khi đăng bài.
   *
   * Lưu ba thứ chứ không chỉ một dấu tick: AI nào cũng ghi được "đã đồng ý", nhưng khi loại một
   * bài đăng thì ban tổ chức phải trả lời được "đồng ý với bản nào, gồm những điều gì, lúc mấy
   * giờ". Thiếu số hiệu bản checklist thì mọi khiếu nại về sau đều thành cảnh hai bên nhớ hai bản
   * khác nhau — mà bài đăng bị từ chối là mất toàn bộ điểm lan tỏa, không có vòng sửa.
   */
  phase3ChecklistAckedAt: timestamp("phase3_checklist_acked_at"),
  phase3ChecklistVersion: text("phase3_checklist_version"),
  /** Mã từng dòng đã tick — bằng chứng người đó đọc qua từng điều, không phải một ô gộp. */
  phase3ChecklistItems: jsonb("phase3_checklist_items").$type<string[]>().notNull().default([]),
  /**
   * Khung giờ thí sinh đã đặt để ban tổ chức duyệt cho bài lên nhóm.
   *
   * Đặt chỗ là việc TIÊU HAO: đặt rồi thì suất đó trừ khỏi hạn mức của khung, và bài bị từ chối
   * cũng không trả suất lại (ban tổ chức chốt 15/09/2026) — suất đó bỏ trống. Trả lại suất cho
   * người khác nghĩa là phải xếp lại lịch duyệt giữa chừng, đúng vào lúc ban tổ chức đang bận
   * nhất trong đợt.
   */
  postingSlotId: integer("posting_slot_id").references(() => postingSlots.id),
  postingSlotBookedAt: timestamp("posting_slot_booked_at"),
  facebookPostUrl: text("facebook_post_url"),
  facebookApprovedAt: timestamp("facebook_approved_at"),
  /**
   * BTC TỪ CHỐI bài đăng. Trạng thái thứ ba bên cạnh "chưa duyệt" và "đã duyệt" — thiếu nó thì một
   * bài bị từ chối trông y hệt bài chưa ai xem, và thí sinh ngồi chờ mãi một câu trả lời đã có.
   *
   * Bị từ chối = mất toàn bộ điểm lan tỏa, không được đăng lại (BTC chốt 15/09/2026, vì đã có
   * checklist hỗ trợ trước khi đăng). Bắt buộc kèm lý do.
   */
  postRejectedAt: timestamp("post_rejected_at"),
  postRejectNote: text("post_reject_note"),
  engagementCount: integer("engagement_count"),
  engagementTier: integer("engagement_tier"), // 1-4

  // CP6
  surveySubmittedAt: timestamp("survey_submitted_at"),

  // Công bố
  // `real` chứ không phải `integer`: điểm chốt là TRUNG BÌNH nhiều giám khảo nên hay ra .5.
  // Làm tròn về số nguyên sẽ tạo đồng hạng giả ở bảng xếp hạng (87.5 và 88 cùng thành 88).
  finalScore: real("final_score"),
  publishedAt: timestamp("published_at"),
  /**
   * Mốc ban tổ chức GỬI điểm từng phase cho thí sinh.
   *
   * Tách khỏi `publishedAt` (kết quả cuối) vì đó là hai việc khác nhau: gửi điểm ý tưởng cho một
   * người mới nộp PRD hoàn toàn khác với chốt tổng điểm và mở cửa phản biện.
   *
   * Điểm từng mục CHỈ hiện cho thí sinh khi cột tương ứng có giá trị. Trước đây điểm hiện ngay khi
   * có phiếu giám khảo, tức là ban tổ chức không cầm quyền gửi điểm dù thể lệ nói vậy — giám khảo
   * chấm xong là thí sinh thấy luôn.
   */
  phase1PublishedAt: timestamp("phase1_published_at"),
  phase2PublishedAt: timestamp("phase2_published_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ideaScores = pgTable(
  "idea_scores",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissions.id),
    /**
     * NULL = điểm do hệ chấm ngoài đẩy về. Có giá trị = một giám khảo chấm tay.
     * Thể lệ: nhiều giám khảo chấm ĐỘC LẬP, điểm cuối là TRUNG BÌNH — thiếu cột này thì
     * ba người chấm chỉ có người cuối được tính (xem lib/db/queries/scores.ts#aggregateModule).
     */
    judgeId: integer("judge_id").references(() => users.id),
    moduleScores: jsonb("module_scores").$type<Record<string, number>>().notNull(), // { giaTriUngDung: number, ... }
    summary: text("summary"),
    source: scoreSourceEnum("source").notNull().default("external_ai"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  // Mỗi giám khảo đúng MỘT phiếu cho mỗi bài. Postgres coi các NULL là khác nhau nên điểm hệ
  // chấm ngoài (judge_id NULL) vẫn đẩy về được nhiều lần — chỉ chặn giám khảo tự nhân phiếu.
  (table) => [unique("idea_scores_submission_judge_uq").on(table.submissionId, table.judgeId)]
);

export const productScores = pgTable(
  "product_scores",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissions.id),
    /** NULL = hệ chấm ngoài; có giá trị = giám khảo chấm tay (điểm cuối lấy trung bình). */
    judgeId: integer("judge_id").references(() => users.id),
    moduleScores: jsonb("module_scores").$type<Record<string, number>>().notNull(), // { chatLuongKyThuat: number, hoanThien: number }
    summary: text("summary"),
    source: scoreSourceEnum("source").notNull().default("external_ai"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("product_scores_submission_judge_uq").on(table.submissionId, table.judgeId)]
);

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
  waves: many(waves),
}));

export const wavesRelations = relations(waves, ({ one, many }) => ({
  season: one(seasons, { fields: [waves.seasonId], references: [seasons.id] }),
  submissions: many(submissions),
  postingSlots: many(postingSlots),
}));

export const postingSlotsRelations = relations(postingSlots, ({ one, many }) => ({
  wave: one(waves, { fields: [postingSlots.waveId], references: [waves.id] }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  user: one(users, { fields: [submissions.userId], references: [users.id] }),
  season: one(seasons, { fields: [submissions.seasonId], references: [seasons.id] }),
  wave: one(waves, { fields: [submissions.waveId], references: [waves.id] }),
  postingSlot: one(postingSlots, {
    fields: [submissions.postingSlotId],
    references: [postingSlots.id],
  }),
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
  judge: one(users, { fields: [ideaScores.judgeId], references: [users.id] }),
}));

export const productScoresRelations = relations(productScores, ({ one }) => ({
  submission: one(submissions, {
    fields: [productScores.submissionId],
    references: [submissions.id],
  }),
  judge: one(users, { fields: [productScores.judgeId], references: [users.id] }),
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
export type Wave = typeof waves.$inferSelect;
export type NewWave = typeof waves.$inferInsert;
export type NewSeason = typeof seasons.$inferInsert;
export type PostingSlot = typeof postingSlots.$inferSelect;
export type NewPostingSlot = typeof postingSlots.$inferInsert;
export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;
export type IdeaScore = typeof ideaScores.$inferSelect;
export type ProductScore = typeof productScores.$inferSelect;
export type Appeal = typeof appeals.$inferSelect;
export type ExperienceSurvey = typeof experienceSurveys.$inferSelect;
