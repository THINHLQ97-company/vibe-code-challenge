"use client";

import { useState, useRef, type ReactNode, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Class của MỘT đầu tab — dùng chung cho `Tabs` (đổi view tại chỗ) và `TabsNav` (đổi route).
 *
 * Tách ra để hai bản không trôi khỏi nhau. Chúng khác nhau về BẢN CHẤT (button điều khiển panel
 * cùng trang ↔ link đi trang khác) nhưng với người dùng phải là CÙNG MỘT vật: cùng cỡ chữ, cùng
 * khoảng đệm, cùng gạch cam. Chép class sang là cách chắc chắn nhất để vài tháng sau hai chỗ lệch
 * nhau 1px mà không ai biết vì sao.
 */
function tabTriggerClass(isActive: boolean, disabled?: boolean) {
  // `inline-flex items-center gap-1.5`: đầu tab nay có thể mang icon, mà icon + chữ ở luồng chữ
  // thường sẽ lệch chân (icon canh theo baseline, không theo tâm dòng). Tab chỉ có chữ không đổi gì.
  return `relative inline-flex items-center gap-1.5 whitespace-nowrap pb-3 pt-2 text-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 rounded-md px-1 select-none ${
    isActive ? "text-ink font-semibold" : "text-ink-2 hover:text-ink"
  } ${
    disabled
      ? "opacity-50 cursor-not-allowed pointer-events-none text-ink-3"
      : "cursor-pointer"
  }`;
}

const TAB_LIST_CLASS =
  "flex items-center gap-6 border-b border-stroke overflow-x-auto scrollbar-none";

/** Gạch cam dưới đầu tab đang chọn. */
const TabUnderline = () => (
  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange rounded-full transition-all duration-200" />
);

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  /**
   * Icon đứng TRƯỚC nhãn — cùng hợp đồng với `TabNavItem.icon` (thêm 26/08/2026).
   *
   * Vì sao đến giờ mới có: DSVH có HAI component tab — `TabsNav` (mỗi tab một URL) và `Tabs` (đổi
   * bằng state). `TabsNav` nhận `icon` từ 08/08, `Tabs` thì không, dù class của nút tab đã mang sẵn
   * `inline-flex items-center gap-1.5` với ghi chú "đầu tab nay có thể mang icon". Tức phần trình
   * bày đã dựng xong cho cả hai, chỉ một bên thiếu đường truyền vào — nên trang nào dùng `Tabs`
   * cũng KHÔNG THỂ có icon, kể cả khi người dựng màn muốn. Chủ dự án bắt được ở /admin/nodes.
   *
   * Là anh em riêng của nhãn (không nhét vào `label`) để nó `shrink-0` được — gộp chung thì khi
   * thanh tab hẹp, `truncate` bóp icon gần về 0px và nó lúc ẩn lúc hiện.
   */
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  /**
   * CHẾ ĐỘ ĐIỀU KHIỂN — truyền `value` thì tab đang mở do NƠI GỌI quyết, `Tabs` thôi giữ state riêng.
   *
   * Thêm 08/08 (đợt 3 bỏ shadcn). Trước bản này `Tabs` chỉ có chế độ tự giữ state, nên mọi màn cần
   * đồng bộ tab với thứ khác đều KHÔNG dùng được: `/admin/settings` ghi tab vào URL (`?tab=email`)
   * để F5 và gửi link còn đúng chỗ, `/admin/dashboard` mở tab theo dòng vừa bấm ở bảng trên. Cả hai
   * buộc phải ở lại `Tabs` của shadcn — không phải vì ngại đổi, mà vì bản DSVH thiếu hẳn một chế độ.
   *
   * Có `value` thì `defaultTab` bị bỏ qua; không có thì mọi thứ chạy y như cũ.
   */
  value?: string;
  onChange?: (id: string) => void;
  /**
   * Bộ điều khiển đứng CÙNG HÀNG với thanh tab, dạt về mép phải — bộ lọc khoảng thời gian, nút làm
   * mới, đếm số…
   *
   * Thêm 08/08. `/admin/nodes/[id]` đặt bộ chọn 1h/24h/7d ngay cạnh thanh tab, mà `Tabs` tự dựng cả
   * hàng nên nơi gọi không có cách nào chen vào — đó là lý do màn đó phải ở lại `Tabs` của shadcn.
   * Không có slot thì nơi gọi buộc phải tự dựng lại thanh tab để đặt được thứ bên cạnh nó, tức là
   * chế ra một bản thứ hai của thứ design system đã có.
   */
  action?: ReactNode;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  value,
  onChange,
  action,
  className = "",
}: TabsProps) {
  const initialTab =
    defaultTab ?? tabs.find((t) => !t.disabled)?.id ?? tabs[0]?.id ?? "";
  const [uncontrolled, setUncontrolled] = useState<string>(initialTab);
  const controlled = value !== undefined;
  const activeTab = controlled ? value : uncontrolled;
  const setActiveTab = (id: string) => { if (!controlled) setUncontrolled(id); };
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = (id: string, disabled?: boolean) => {
    if (disabled) return;
    setActiveTab(id);
    onChange?.(id);
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    const enabledTabs = tabs
      .map((t, idx) => ({ ...t, originalIndex: idx }))
      .filter((t) => !t.disabled);

    if (enabledTabs.length === 0) return;

    const currentEnabledPos = enabledTabs.findIndex(
      (t) => t.originalIndex === currentIndex
    );
    let targetEnabledPos = -1;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      targetEnabledPos = (currentEnabledPos + 1) % enabledTabs.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      targetEnabledPos =
        (currentEnabledPos - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      targetEnabledPos = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      targetEnabledPos = enabledTabs.length - 1;
    }

    if (targetEnabledPos !== -1) {
      const targetTab = enabledTabs[targetEnabledPos];
      handleSelect(targetTab.id, targetTab.disabled);
      tabRefs.current[targetTab.originalIndex]?.focus();
    }
  };

  const activeTabItem = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className={`w-full ${className}`}>
      {/* HÀNG ĐẦU: thanh tab, và khi có `action` thì thêm bộ điều khiển dạt về mép phải.
          Lớp bọc chỉ sinh ra khi CÓ `action` — không thì cây DOM giữ nguyên như trước, để 5 màn
          đang dùng `Tabs` không đổi một pixel nào. */}
      <div
        className={
          action ? "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" : undefined
        }
      >
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={TAB_LIST_CLASS}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(tab.id, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={tabTriggerClass(isActive, tab.disabled)}
            >
              {tab.icon ? <span className="shrink-0">{tab.icon}</span> : null}
              {tab.label}
              {isActive && <TabUnderline />}
            </button>
          );
        })}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      {/* Tabpanel */}
      {activeTabItem && (
        <div
          role="tabpanel"
          id={`panel-${activeTabItem.id}`}
          aria-labelledby={`tab-${activeTabItem.id}`}
          tabIndex={0}
          className="py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/30 rounded-lg text-ink"
        >
          {activeTabItem.content}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   TabsNav — tab ĐI THEO ROUTE
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

export interface TabNavItem {
  /** Đường dẫn của tab. Mỗi tab MỘT url — đó là toàn bộ lý do component này tồn tại. */
  href: string;
  label: ReactNode;
  /**
   * Chỉ sáng khi `pathname` TRÙNG KHÍT `href`, không nhận route con.
   *
   * Bắt buộc bật cho tab "trang gốc" của một cụm (vd `/profile` khi còn `/profile/security`):
   * quy tắc mặc định coi tiền tố là khớp, nên không có cờ này thì `/profile/security` làm SÁNG
   * CẢ HAI tab và người dùng không biết mình đang ở đâu.
   */
  exact?: boolean;
  /**
   * Icon đứng TRƯỚC nhãn. Là anh em riêng của nhãn (không nhét vào `label`) để nó `shrink-0` được —
   * cùng lý do `CardHeader` tách `icon` khỏi `title`: gộp chung thì khi thanh tab hẹp, `truncate`
   * bóp icon gần về 0px và nó lúc ẩn lúc hiện.
   */
  icon?: ReactNode;
  disabled?: boolean;
}

/**
 * Cùng vẻ ngoài với `Tabs` nhưng mỗi đầu tab là một LINK, trạng thái chọn đọc từ `usePathname()`.
 *
 * Khi nào dùng cái nào:
 *  · `Tabs`    — đổi view TẠI CHỖ (lọc bảng: Tất cả / Đang chạy / Lỗi). Trạng thái không đáng có url.
 *  · `TabsNav` — mỗi mục là một MÀN riêng, cần gửi link được, cần nút Back của trình duyệt chạy
 *                đúng, cần refresh giữ nguyên chỗ đang đứng. Vd cụm cài đặt tài khoản.
 *
 * Vì sao KHÔNG dùng `role="tablist"` ở đây: vai trò tab của ARIA bắt buộc đầu tab phải điều khiển
 * một panel NẰM CÙNG TÀI LIỆU. Ở đây bấm vào là điều hướng sang màn khác, không có panel nào để
 * điều khiển. Gắn role tab vào link là nói dối trình đọc màn hình — người dùng sẽ nghe "tab 2/3"
 * rồi bấm và thấy cả trang đổi. Đúng ngữ nghĩa là một vùng điều hướng: `<nav>` + `aria-current`.
 */
export function TabsNav({
  items,
  label,
  className = "",
}: {
  items: TabNavItem[];
  /** Nhãn cho vùng điều hướng — trình đọc màn hình đọc lên để phân biệt với nav chính. */
  label: string;
  className?: string;
}) {
  const pathname = usePathname();
  const isActive = (item: TabNavItem) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <nav aria-label={label} className={`w-full ${className}`}>
      <div className={TAB_LIST_CLASS}>
        {items.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              aria-disabled={item.disabled}
              tabIndex={item.disabled ? -1 : undefined}
              className={tabTriggerClass(active, item.disabled)}
            >
              {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
              {item.label}
              {active && <TabUnderline />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
