"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";

export type NavItem = { href: string; label: string; icon: string };

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
          <span className="text-xl">🌀</span>
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
          <div className="text-caption font-medium" style={{ color: "var(--ds-fg-mute)" }}>
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
