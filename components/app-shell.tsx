"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

// icon: ReactNode (JSX đã dựng sẵn, vd <Home size={16}/>) — KHÔNG dùng component
// reference (LucideIcon) vì Server Component (các layout) không serialize được
// function khi truyền prop sang Client Component (AppShell) — lỗi RSC runtime.
export type NavItem = { href: string; label: string; icon: ReactNode };

export function AppShell({
  brand,
  subtitle,
  nav,
  userLine,
  children,
}: {
  brand: string;
  subtitle: string;
  nav: NavItem[];
  userLine: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside
        className="flex w-60 shrink-0 flex-col"
        style={{ background: "var(--ds-sidebar-bg)" }}
      >
        <div className="flex items-center gap-2 px-4 py-4 text-white">
          <span
            className="flex size-8 items-center justify-center rounded-lg"
            style={{ background: "var(--ds-sidebar-accent)" }}
          >
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          <div>
            <div className="text-sm font-bold leading-tight">{brand}</div>
            <div className="text-[11px] leading-tight" style={{ color: "var(--ds-sidebar-fg)" }}>
              {subtitle}
            </div>
          </div>
        </div>
        <nav className="ds-nav flex-1">
          {nav.map((item) => {
            const active = item.href === "/dashboard" || item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ds-nav-item${active ? " active" : ""}`}
              >
                <span className="ds-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between border-b px-6 py-3"
          style={{ background: "var(--ds-surface)", borderColor: "var(--ds-border)" }}
        >
          <div className="text-sm font-medium" style={{ color: "var(--ds-fg-mute)" }}>
            {userLine}
          </div>
          <LogoutButton />
        </header>
        <main className="flex-1 p-6" style={{ background: "var(--ds-bg)" }}>
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
