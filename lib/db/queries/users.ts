import { asc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { users, submissions, ideaScores, productScores } from "../schema";

export type ManagedUser = {
  id: number;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  department: string | null;
  departmentRaw: string | null;
  board: "ky_thuat" | "van_phong" | null;
  role: "candidate" | "judge" | "admin";
  /** `microsoft` hoặc `mật khẩu` — biết ai vào bằng đường nào để gỡ rối khi có người kêu không đăng nhập được. */
  loginMethod: "microsoft" | "password" | "none";
  lastLoginAt: Date | null;
  createdAt: Date;
  submissionCount: number;
};

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl,
      department: users.department,
      departmentRaw: users.departmentRaw,
      board: users.board,
      role: users.role,
      oauthProvider: users.oauthProvider,
      passwordHash: users.passwordHash,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      submissionCount: sql<number>`(
        select count(*)::int from ${submissions} where ${submissions.userId} = ${users.id}
      )`,
    })
    .from(users)
    .orderBy(asc(users.email));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    avatarUrl: r.avatarUrl,
    department: r.department,
    departmentRaw: r.departmentRaw,
    board: r.board,
    role: r.role,
    loginMethod: r.oauthProvider === "microsoft" ? "microsoft" : r.passwordHash ? "password" : "none",
    lastLoginAt: r.lastLoginAt,
    createdAt: r.createdAt,
    submissionCount: Number(r.submissionCount ?? 0),
  }));
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email.toLowerCase()) });
}

/**
 * MỜI TRƯỚC một người vào vai trò nào đó — tạo sẵn bản ghi trước khi họ đăng nhập lần đầu.
 *
 * Cần thiết vì tài khoản chỉ sinh ra khi người đó đăng nhập Microsoft. Không có đường này thì BTC
 * phải chờ từng giám khảo tự vào rồi mới nâng quyền được, tức không chuẩn bị hội đồng trước khai
 * mạc được.
 *
 * KHÔNG đặt mật khẩu: bản ghi này chỉ là chỗ giữ vai trò. Khi người đó đăng nhập Microsoft, luồng
 * callback tìm theo email và gắn danh tính vào đúng bản ghi này — vai trò giữ nguyên.
 */
export async function inviteUser(email: string, role: "judge" | "admin", name?: string) {
  const [row] = await db
    .insert(users)
    .values({ email: email.toLowerCase(), name: name ?? null, role })
    .returning();
  return row;
}

export async function setUserRole(id: number, role: "candidate" | "judge" | "admin") {
  const [row] = await db.update(users).set({ role }).where(eq(users.id, id)).returning();
  return row;
}

/** Đếm admin để không cho hạ quyền người cuối cùng — tự khoá mình ra khỏi hệ thống. */
export async function countAdmins(): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(users)
    .where(eq(users.role, "admin"));
  return Number(row?.n ?? 0);
}

/**
 * Xoá một tài khoản, kèm mọi phiếu chấm của họ.
 *
 * Phiếu chấm bị xoá theo, KHÔNG phải để cho tiện: cột `judge_id` trỏ tới `users`, giữ phiếu lại mà
 * xoá người là để lại bản ghi trỏ vào hư không. Và một phiếu không còn ai chịu trách nhiệm thì
 * cũng không nên tính vào điểm trung bình.
 *
 * KHÔNG xoá được người đã có bài dự thi — bài thi là dữ liệu của cuộc thi, không phải của một tài
 * khoản; xoá người là mất luôn chủ của bài. Trường hợp đó phải hạ vai trò thay vì xoá.
 */
export async function deleteUserCascade(id: number): Promise<{ ok: true; ballots: number } | { ok: false; error: string }> {
  const [sub] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(submissions)
    .where(eq(submissions.userId, id));
  if (Number(sub?.n ?? 0) > 0) {
    return { ok: false, error: "Tài khoản này đang có bài dự thi — hạ vai trò thay vì xoá" };
  }

  const removed = await db.transaction(async (tx) => {
    const a = await tx.delete(ideaScores).where(eq(ideaScores.judgeId, id)).returning({ id: ideaScores.id });
    const b = await tx
      .delete(productScores)
      .where(eq(productScores.judgeId, id))
      .returning({ id: productScores.id });
    await tx.delete(users).where(eq(users.id, id));
    return a.length + b.length;
  });

  return { ok: true, ballots: removed };
}

/** Đếm phiếu chấm của một người — để giao diện nói trước sẽ mất bao nhiêu phiếu khi xoá. */
export async function countBallotsOf(id: number): Promise<number> {
  const [a] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(ideaScores)
    .where(eq(ideaScores.judgeId, id));
  const [b] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(productScores)
    .where(eq(productScores.judgeId, id));
  return Number(a?.n ?? 0) + Number(b?.n ?? 0);
}
