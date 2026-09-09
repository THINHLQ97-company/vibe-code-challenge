import Link from "next/link";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { LogoutButton } from "@/components/logout-button";

const NAV = [
  { href: "/dashboard", label: "Tổng quan" },
  { href: "/dashboard/register", label: "Đề tài của tôi" },
  { href: "/dashboard/build", label: "Nộp bài" },
  { href: "/dashboard/share", label: "Chia sẻ & lan tỏa" },
  { href: "/dashboard/survey", label: "Phiếu trải nghiệm" },
  { href: "/dashboard/results", label: "Kết quả" },
  { href: "/dashboard/leaderboard", label: "Bảng xếp hạng" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(users.id, session.userId) })
    : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-stroke bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-bold text-ink">
            <span className="text-xl">🌀</span> Vibe Code Challenge
          </div>
          <div className="flex items-center gap-3 text-caption text-ink-2">
            <span>
              {user?.name} · {user?.department}
            </span>
            <LogoutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-6 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-caption font-semibold text-ink-2 hover:bg-stroke-soft hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
    </div>
  );
}
