import { asc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { users, submissions } from "../schema";

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
