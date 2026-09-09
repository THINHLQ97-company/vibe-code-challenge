import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, seasons, submissions, ideaScores, departmentToBoard } from "./schema";

const DEV_PASSWORD = "Test@1234";

async function main() {
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

  const [candidateTech] = await db
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

  const [candidateOffice] = await db
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

  const [season] = await db
    .insert(seasons)
    .values({
      name: "Mùa 1 · 2026",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-01-01"),
      capPerWeek: 35,
    })
    .returning();

  // Submission 1: đã qua Phase 1, đang làm Phase 2
  const [sub1] = await db
    .insert(submissions)
    .values({
      userId: candidateTech.id,
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

  // Submission 2: mới đăng ký, chờ duyệt (CP2)
  await db.insert(submissions).values({
    userId: candidateOffice.id,
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
    registrationStatus: "pending",
  });

  console.log("✓ Seed xong:");
  console.log(`  admin: admin@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  judge: giamkhao@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  candidate (TS, Phase 2): thisinh.ts@matbao.com / ${DEV_PASSWORD}`);
  console.log(`  candidate (MK, pending): thisinh.mk@matbao.com / ${DEV_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
