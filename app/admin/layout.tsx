import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { LogoutButton } from "@/components/logout-button";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/topics", label: "Duyệt đề tài" },
  { href: "/admin/scoring", label: "Chấm điểm & feedback" },
  { href: "/admin/security", label: "An toàn (CP4)" },
  { href: "/admin/posts", label: "Bài đăng & lan tỏa" },
  { href: "/admin/appeals", label: "Phản biện" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-stroke bg-canvas">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="text-xl">🛠️</span> BTC · Vibe Code Challenge
          </div>
          <div className="flex items-center gap-3 text-caption text-white/70">
            <span>
              {user?.name} · {user?.role}
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-caption font-semibold text-white/70 hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
    </div>
  );
}
