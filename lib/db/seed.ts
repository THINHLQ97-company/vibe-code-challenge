import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  seasons,
  submissions,
  ideaScores,
  productScores,
  appeals,
  departmentToBoard,
} from "./schema";

/** PRD mẫu — đủ dài và đủ mục để demo màn chấm Phase 1 đọc ra thứ có nghĩa. */
function samplePrd(name: string, problem: string, users: string, features: string[]) {
  return `# ${name}

## 1. Bài toán
${problem}

## 2. Người dùng
${users}

## 3. Phạm vi phiên bản đầu
${features.map((f) => `- ${f}`).join("\n")}

## 4. Luồng chính
1. Người dùng đăng nhập bằng tài khoản nội bộ.
2. Tạo bản ghi mới và điền các trường bắt buộc.
3. Xem lại danh sách, lọc theo trạng thái và thời gian.
4. Xuất kết quả ra file để gửi cho người liên quan.

## 5. Dữ liệu
Toàn bộ là dữ liệu giả do tôi tự sinh, không lấy từ hệ thống thật. Lưu trên Postgres,
mỗi bảng có khoá chính và mốc thời gian tạo/sửa.

## 6. Ngoài phạm vi
- Không phân quyền nhiều cấp.
- Không tích hợp hệ thống nội bộ nào của Mắt Bão.
- Không thu thập thông tin cá nhân người dùng cuối.

## 7. Tiêu chí hoàn thành
Chạy được trên Vibe Host, ba chức năng chính dùng thật với dữ liệu trong database,
không có khoá API hay chuỗi kết nối nằm trong mã nguồn.
`;
}

const DEV_PASSWORD = "Test@1234";

async function main() {
  // Seed phải chạy lại được nhiều lần (mỗi lần sửa luồng là phải dựng lại dữ liệu demo).
  // Chặn ở production vì lệnh này XOÁ SẠCH dữ liệu — đặt SEED_FORCE=1 nếu thật sự muốn.
  if (process.env.NODE_ENV === "production" && process.env.SEED_FORCE !== "1") {
    console.error("Từ chối seed trên production (lệnh này xoá sạch dữ liệu). Đặt SEED_FORCE=1 nếu chắc chắn.");
    process.exit(1);
  }
  await db.execute(
    sql`TRUNCATE TABLE appeals, experience_surveys, idea_scores, product_scores, submissions, seasons, users RESTART IDENTITY CASCADE`
  );

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const [admin] = await db
    .insert(users)
    .values({
      email: "admin@matbao.com",
      name: "Admin BTC",
      passwordHash,
      department: "MK",
      board: departmentToBoard.MK,
      role: "admin",
    })
    .returning();
  void admin;

  // Hai giám khảo, không phải một: thể lệ chấm ĐỘC LẬP rồi lấy trung bình, nên seed phải có đủ
  // hai phiếu thì mới demo được đúng cách tính điểm (và mới lộ ra nếu code lại lấy phiếu mới nhất).
  const [judge] = await db
    .insert(users)
    .values({
      email: "giamkhao@matbao.com",
      name: "Giám khảo Demo",
      passwordHash,
      department: "DE",
      board: departmentToBoard.DE,
      role: "judge",
    })
    .returning();

  const [judge2] = await db
    .insert(users)
    .values({
      email: "giamkhao2@matbao.com",
      name: "Giám khảo Demo 2",
      passwordHash,
      department: "TS",
      board: departmentToBoard.TS,
      role: "judge",
    })
    .returning();

  const [candTS] = await db
    .insert(users)
    .values({
      email: "thisinh.ts@matbao.com",
      name: "Nguyễn Văn A",
      passwordHash,
      employeeCode: "NV001",
      department: "TS",
      board: departmentToBoard.TS,
      role: "candidate",
    })
    .returning();

  const [candMK] = await db
    .insert(users)
    .values({
      email: "thisinh.mk@matbao.com",
      name: "Trần Thị B",
      passwordHash,
      employeeCode: "NV002",
      department: "MK",
      board: departmentToBoard.MK,
      role: "candidate",
    })
    .returning();

  const [candDE] = await db
    .insert(users)
    .values({
      email: "thisinh.de@matbao.com",
      name: "Lê Văn C",
      passwordHash,
      employeeCode: "NV003",
      department: "DE",
      board: departmentToBoard.DE,
      role: "candidate",
    })
    .returning();

  const [candSales] = await db
    .insert(users)
    .values({
      email: "thisinh.sales@matbao.com",
      name: "Phạm Thị D",
      passwordHash,
      employeeCode: "NV004",
      department: "SALES",
      board: departmentToBoard.SALES,
      role: "candidate",
    })
    .returning();

  const [candHR] = await db
    .insert(users)
    .values({
      email: "thisinh.hr@matbao.com",
      name: "Hoàng Văn E",
      passwordHash,
      employeeCode: "NV005",
      department: "HR",
      board: departmentToBoard.HR,
      role: "candidate",
    })
    .returning();

  const [season] = await db
    .insert(seasons)
    .values({
      name: "Mùa 1 · 2026",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-01-01"),
      capPerWeek: 35,
    })
    .returning();

  // 1) TS — đã duyệt, đang ở Phase 2 (đã có điểm ý tưởng, đang chờ nộp/chấm sản phẩm)
  const [sub1] = await db
    .insert(submissions)
    .values({
      userId: candTS.id,
      seasonId: season.id,
      productName: "Chẩn đoán lỗi website mini",
      branch: "A",
      topicGroup: "Website / Kỹ thuật",
      problemDesc: "Đồng nghiệp TS mất nhiều thời gian tra cứu triệu chứng lỗi website phổ biến.",
      targetUsers: "Đồng nghiệp phòng TS, ước lượng ~15 người gặp đúng vấn đề.",
      features: ["Nhập triệu chứng lỗi", "Gợi ý hướng khắc phục", "Lưu lịch sử tra cứu"],
      databasePlan: "Bảng triệu chứng ↔ hướng khắc phục, lưu Postgres",
      hasWorkflow: false,
      deployMethod: "Tự dựng mới trong kỳ thi",
      isPrebuiltRepo: false,
      aiTool: "Claude Code",
      googleAiPro: true,
      dataUsed: "Dữ liệu triệu chứng lỗi giả lập",
      riskSelfAssessment: "Không chạm dữ liệu khách thật",
      confirmFakeData: true,
      confirmNoMatbaoInfo: true,
      confirmTemplateConsent: true,
      prdContent: samplePrd(
        "Chẩn đoán lỗi website mini",
        "Đồng nghiệp TS mất nhiều thời gian tra cứu triệu chứng lỗi website phổ biến.",
        "Đồng nghiệp phòng TS, ước lượng ~15 người gặp đúng vấn đề.",
        ["Nhập triệu chứng lỗi", "Gợi ý hướng khắc phục", "Lưu lịch sử tra cứu"]
      ),
      prdFileName: "chan-doan-loi-website.md",
      registrationStatus: "approved",
      approvedAt: new Date(),
      submissionDeadline: new Date(Date.now() + 10 * 24 * 3600 * 1000),
      currentPhase: 2,
      vibehostUrl: "https://demo-chuandoan-loi.vibehost.vn",
    })
    .returning();
  await db.insert(ideaScores).values({
    submissionId: sub1.id,
    moduleScores: { giaTriUngDung: 22 },
    summary: "Bài toán thật, phạm vi rõ ràng, có phương án database khả thi.",
    source: "external_ai",
  });

  // 2) MK — mới đăng ký, chờ duyệt CP2
  await db.insert(submissions).values({
    userId: candMK.id,
    seasonId: season.id,
    productName: "Lịch nội dung Marketing mini",
    branch: "B",
    topicGroup: "Marketing / Sales / CSKH",
    problemDesc: "Tự sắp lịch đăng bài nhiều kênh, hay quên hạn đăng.",
    targetUsers: "Chính bản thân, ước lượng nhiều đồng nghiệp MK khác cũng gặp.",
    features: ["Lên lịch theo kênh", "Nhắc hạn đăng", "Xem lịch theo tuần"],
    databasePlan: "Bảng lịch đăng + bài viết, lưu Postgres",
    hasWorkflow: true,
    workflowDesc: "Cron nhắc hạn đăng qua email mỗi sáng",
    deployMethod: "Tự dựng mới trong kỳ thi",
    isPrebuiltRepo: false,
    aiTool: "Google AI Pro",
    googleAiPro: true,
    dataUsed: "Dữ liệu lịch đăng giả lập",
    confirmFakeData: true,
    confirmNoMatbaoInfo: true,
    confirmTemplateConsent: true,
    prdContent: samplePrd(
      "Lịch nội dung Marketing mini",
      "Tự sắp lịch đăng bài nhiều kênh, hay quên hạn đăng.",
      "Chính bản thân, ước lượng nhiều đồng nghiệp MK khác cũng gặp.",
      ["Lên lịch theo kênh", "Nhắc hạn đăng", "Xem lịch theo tuần"]
    ),
    prdFileName: "lich-noi-dung-marketing.md",
    registrationStatus: "pending",
  });

  // 3) DE — đã công bố kết quả đầy đủ (demo trọn luồng CP1-CP6 + BXH)
  const [sub3] = await db
    .insert(submissions)
    .values({
      userId: candDE.id,
      seasonId: season.id,
      productName: "Trợ lý báo giá nhanh",
      branch: "A",
      topicGroup: "Kinh doanh / bán hàng",
      problemDesc: "Sales mất nhiều thời gian soạn báo giá thủ công cho từng khách.",
      targetUsers: "Đội Sales, ~10 người dùng thường xuyên.",
      features: ["Chọn gói dịch vụ", "Tự tính giá theo combo", "Xuất PDF báo giá"],
      databasePlan: "Bảng gói dịch vụ + lịch sử báo giá, lưu Postgres",
      hasWorkflow: true,
      workflowDesc: "Tự gửi email báo giá sau khi tạo",
      deployMethod: "Tự dựng mới trong kỳ thi",
      isPrebuiltRepo: false,
      aiTool: "Claude Code",
      googleAiPro: true,
      dataUsed: "Dữ liệu gói dịch vụ giả lập",
      confirmFakeData: true,
      confirmNoMatbaoInfo: true,
      confirmTemplateConsent: true,
      prdContent: samplePrd(
        "Trợ lý báo giá nhanh",
        "Sales mất nhiều thời gian soạn báo giá thủ công cho từng khách.",
        "Đội Sales, ~10 người dùng thường xuyên.",
        ["Chọn gói dịch vụ", "Tự tính giá theo combo", "Xuất PDF báo giá"]
      ),
      prdFileName: "tro-ly-bao-gia.md",
      registrationStatus: "approved",
      approvedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000),
      submissionDeadline: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      currentPhase: 4,
      vibehostUrl: "https://tro-ly-bao-gia.vibehost.vn",
      githubRepoUrl: "https://github.com/levanc/tro-ly-bao-gia",
      githubVerifiedAt: new Date(Date.now() - 9 * 24 * 3600 * 1000),
      securityStatus: "clean",
      facebookPostUrl: "https://facebook.com/groups/vibecodingchua/posts/demo-3",
      facebookApprovedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      engagementCount: 95,
      engagementTier: 4,
      btcFeedback: "Không cần sửa gì thêm.",
      feedbackStatus: "approved",
      kpi3pFlag: true,
      surveySubmittedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      finalScore: 91.5,
      publishedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
    })
    .returning();
  // Điểm hệ chấm ngoài đẩy về trước, rồi hai giám khảo chấm tay đè lên — đúng thứ tự thực tế.
  // Điểm chốt = trung bình HAI phiếu giám khảo: giá trị ứng dụng (22+24)/2 = 23,
  // kỹ thuật (36+34)/2 = 35, hoàn thiện (14+13)/2 = 13.5, lan tỏa bậc 4 = 20 → 91.5.
  await db.insert(ideaScores).values([
    {
      submissionId: sub3.id,
      moduleScores: { giaTriUngDung: 24 },
      summary: "Máy chấm: bài toán rất sát nghiệp vụ Sales hằng ngày.",
      source: "external_ai",
    },
    {
      submissionId: sub3.id,
      judgeId: judge.id,
      moduleScores: { giaTriUngDung: 22 },
      summary: "Đúng nhu cầu thật, nhưng phạm vi còn hẹp.",
      source: "judge",
    },
    {
      submissionId: sub3.id,
      judgeId: judge2.id,
      moduleScores: { giaTriUngDung: 24 },
      summary: "Giá trị rõ, đo được thời gian tiết kiệm.",
      source: "judge",
    },
  ]);
  await db.insert(productScores).values([
    {
      submissionId: sub3.id,
      judgeId: judge.id,
      moduleScores: { chatLuongKyThuat: 36, hoanThien: 14 },
      summary: "Chạy tốt, database dùng thật, workflow tự động chạy ổn định.",
      source: "judge",
    },
    {
      submissionId: sub3.id,
      judgeId: judge2.id,
      moduleScores: { chatLuongKyThuat: 34, hoanThien: 13 },
      summary: "Code sạch, thiếu kiểm thử tự động.",
      source: "judge",
    },
  ]);

  // 4) SALES — đã công bố, điểm thấp hơn (demo bảng xếp hạng có thứ hạng)
  const [sub4] = await db
    .insert(submissions)
    .values({
      userId: candSales.id,
      seasonId: season.id,
      productName: "CRM cá nhân mini",
      branch: "B",
      topicGroup: "Kinh doanh / bán hàng",
      problemDesc: "Khó theo dõi khách đang chăm tới đâu, hay quên follow-up.",
      targetUsers: "Chính bản thân, nhiều Sales khác cũng gặp.",
      features: ["Ghi chú theo khách", "Nhắc lịch follow-up", "Lọc theo trạng thái"],
      databasePlan: "Bảng khách hàng + lịch sử liên hệ, lưu Postgres",
      hasWorkflow: false,
      deployMethod: "Deploy từ Git-repo / mẫu có sẵn trước đó",
      isPrebuiltRepo: true,
      aiTool: "Cursor",
      googleAiPro: false,
      dataUsed: "Dữ liệu khách hàng giả lập",
      confirmFakeData: true,
      confirmNoMatbaoInfo: true,
      confirmTemplateConsent: true,
      prdContent: samplePrd(
        "CRM cá nhân mini",
        "Khó theo dõi khách đang chăm tới đâu, hay quên follow-up.",
        "Chính bản thân, nhiều Sales khác cũng gặp.",
        ["Ghi chú theo khách", "Nhắc lịch follow-up", "Lọc theo trạng thái"]
      ),
      prdFileName: "crm-ca-nhan-mini.md",
      registrationStatus: "approved",
      approvedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000),
      submissionDeadline: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      currentPhase: 4,
      vibehostUrl: "https://crm-mini.vibehost.vn",
      githubRepoUrl: "https://github.com/phamthid/crm-mini",
      githubVerifiedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      securityStatus: "clean",
      facebookPostUrl: "https://facebook.com/groups/vibecodingchua/posts/demo-4",
      facebookApprovedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      engagementCount: 40,
      engagementTier: 2,
      btcFeedback: "Đạt yêu cầu.",
      feedbackStatus: "approved",
      kpi3pFlag: true,
      surveySubmittedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
      finalScore: 60,
      publishedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    })
    .returning();
  // Chỉ một giám khảo chấm — trung bình của một phiếu vẫn là chính nó. 20 + 10 + 20 + 10 = 60.
  await db.insert(ideaScores).values({
    submissionId: sub4.id,
    judgeId: judge.id,
    moduleScores: { giaTriUngDung: 20 },
    summary: "Ý tưởng ổn, khá phổ biến trong nhóm chủ đề này.",
    source: "judge",
  });
  await db.insert(productScores).values({
    submissionId: sub4.id,
    judgeId: judge.id,
    // Deploy từ repo có sẵn -> trần kỹ thuật 20 (dù chấm gốc có thể cao hơn)
    moduleScores: { chatLuongKyThuat: 24, hoanThien: 10 },
    summary: "Dùng lại repo mẫu, có chỉnh sửa nhưng chưa nhiều.",
    source: "judge",
  });

  // 5) HR — bị trả về, minh hoạ cơ chế sửa & nộp lại
  await db.insert(submissions).values({
    userId: candHR.id,
    seasonId: season.id,
    productName: "Checklist onboarding",
    branch: "A",
    topicGroup: "Văn phòng / Nhân sự",
    problemDesc: "Onboarding nhân viên mới còn thủ công, dễ sót bước.",
    targetUsers: "Nhân viên mới + quản lý trực tiếp.",
    features: ["Tạo checklist theo phòng ban", "Tick tiến độ", "Nhắc hạn"],
    databasePlan: "Bảng checklist + tiến độ, lưu Postgres",
    hasWorkflow: false,
    deployMethod: "Tự dựng mới trong kỳ thi",
    isPrebuiltRepo: false,
    aiTool: "ChatGPT",
    googleAiPro: false,
    dataUsed: "Dữ liệu nhân sự giả lập",
    confirmFakeData: true,
    confirmNoMatbaoInfo: true,
    confirmTemplateConsent: true,
    prdContent: samplePrd(
      "Checklist onboarding",
      "Onboarding nhân viên mới còn thủ công, dễ sót bước.",
      "Nhân viên mới + quản lý trực tiếp.",
      ["Tạo checklist theo phòng ban", "Tick tiến độ", "Nhắc hạn"]
    ),
    prdFileName: "checklist-onboarding.md",
    registrationStatus: "returned",
    registrationNote: "Chưa nêu rõ 3 chức năng cụ thể để chấm ngưỡng sàn — bổ sung chi tiết hơn.",
  });

  // Phản biện mẫu cho sub4 (đã xử lý) — demo màn /admin/appeals
  await db.insert(appeals).values({
    submissionId: sub4.id,
    criteria: "Điểm kỹ thuật bị trần 20 dù đã chỉnh sửa nhiều so với repo gốc",
    evidenceUrl: "https://github.com/phamthid/crm-mini/commits/main",
    status: "rejected",
    resolutionNote: "Lịch sử commit cho thấy phần tự viết thêm chưa đủ đáng kể để bỏ trần.",
    resolvedBy: judge.id,
    resolvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
  });

  console.log("✓ Seed xong:");
  console.log(`  admin:            admin@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  judge:            giamkhao@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  judge 2:          giamkhao2@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  candidate TS      thisinh.ts@matbao.com / ${DEV_PASSWORD}     (Phase 2, chưa nộp Vibe Host)`);
  console.log(`  candidate MK      thisinh.mk@matbao.com / ${DEV_PASSWORD}     (chờ duyệt CP2)`);
  console.log(`  candidate DE      thisinh.de@matbao.com / ${DEV_PASSWORD}     (đã công bố · 91.5đ, 2 giám khảo)`);
  console.log(`  candidate SALES   thisinh.sales@matbao.com / ${DEV_PASSWORD}  (đã công bố · 60đ, repo có sẵn)`);
  console.log(`  candidate HR      thisinh.hr@matbao.com / ${DEV_PASSWORD}     (bị trả về CP2)`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
