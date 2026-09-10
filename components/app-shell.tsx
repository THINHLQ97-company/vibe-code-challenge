"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LogoSquare, LogoWideDark } from "@/components/brand";
import { Avatar } from "@/components/dsvh/ui/data/Avatar";
import { LogoutButton } from "@/components/logout-button";

/**
 * Khung app: cột điều hướng nền `canvas` + vùng nội dung.
 *
 * Chữ trên cột điều hướng dùng `cream` chứ không `surface`/`white`: `canvas` là token TỐI ở CẢ HAI
 * theme (#212230 sáng · #0e0f14 tối) nên chữ phải là token KHÔNG đảo — `cream` đúng vai đó (không
 * có giá trị dark), cùng cách `AuthCard` của DSVH đang làm. Ghim `text-white` là dính đúng lỗi mà
 * gate INVERTPAIR gác.
 *
 * `icon: ReactNode` (JSX dựng sẵn) chứ không phải component reference: nav khai ở Server Component
 * còn khung này là Client Component — truyền function qua ranh giới đó là lỗi RSC lúc chạy.
 */
export type NavItem = { href: string; label: string; icon: ReactNode };

export function AppShell({
  brandTitle,
  brandSubtitle,
  nav,
  userName,
  userMeta,
  avatarUrl,
  profileHref,
  children,
}: {
  brandTitle: string;
  brandSubtitle: string;
  nav: NavItem[];
  userName: string;
  userMeta: string;
  avatarUrl?: string | null;
  profileHref: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-surface-2">
      <aside className="hidden w-60 shrink-0 flex-col bg-canvas md:flex">
        {/* Logo NGANG bản tối: đọc được tên cuộc thi ngay trên cột điều hướng, thay vì một khối
            vuông cụt kèm chữ gõ tay. `brandTitle` giờ chỉ còn dùng cho thanh đầu ở mobile. */}
        <div className="px-4 py-5">
          {/* Cột rộng 240px, trừ đệm còn 208px — logo tỉ lệ 3,62:1 ở chiều cao 40 chiếm 145px,
              vừa đủ thoáng mà vẫn đọc rõ chữ. */}
          <LogoWideDark height={40} />
          <div className="mt-2 truncate text-meta text-cream/60">{brandSubtitle}</div>
        </div>

        <nav className="flex flex-col gap-0.5 px-2 py-2">
          {nav.map((item) => {
            const isRoot = item.href === "/dashboard" || item.href === "/admin";
            const active = isRoot ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-caption font-medium transition-colors ${
                  active
                    ? "bg-orange/15 text-cream before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r before:bg-orange before:content-['']"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <span className={active ? "text-orange-bright" : "opacity-70"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-stroke bg-surface px-4 py-2.5 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <LogoSquare size={30} />
            <span className="text-caption font-semibold text-ink">{brandTitle}</span>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            {/* Avatar + tên là MỘT liên kết tới hồ sơ — chỗ người ta theo bản năng bấm vào để đổi
                ảnh hay mật khẩu, thay vì phải đi tìm một mục menu riêng. */}
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-surface-hover"
            >
              <div className="hidden text-right sm:block">
                <div className="text-caption font-medium text-ink">{userName}</div>
                <div className="text-meta text-ink-3">{userMeta}</div>
              </div>
              <Avatar name={userName} src={avatarUrl ?? undefined} size="sm" />
            </Link>
            <LogoutButton />
          </div>
        </header>

        {/* Cột điều hướng ẩn ở mobile — thay bằng thanh cuộn ngang để không mất lối đi. */}
        <nav className="flex gap-1 overflow-x-auto border-b border-stroke bg-surface px-3 py-1.5 md:hidden">
          {nav.map((item) => {
            const isRoot = item.href === "/dashboard" || item.href === "/admin";
            const active = isRoot ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-caption font-medium ${
                  active ? "bg-orange/12 text-orange-strong" : "text-ink-2"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
