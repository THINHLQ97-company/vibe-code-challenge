import type { ComponentType } from "react";

import { Card } from "@/components/dsvh/ui/Card";
import { Skeleton } from "@/components/dsvh/ui/nav/Skeleton";

/**
 * Ô KPI tóm tắt — hàng 4 ô ngay dưới `PageHeader` (xem "Cấu trúc trang", nhóm Bố cục).
 *
 * Tĩnh, KHÔNG bấm được: đây là số liệu tóm tắt, không phải bộ lọc. Cho bấm mà không nói ra thì
 * người dùng bấm thử rồi tưởng hệ đơ.
 *
 * ĐƯA VÀO DSVH 05/08/2026 sau khi đo ra **5 bản cùng tồn tại**: `shared/stat-card.tsx` + 4 bản tự
 * viết trong module (dashboard, admin-plans, backups, admin-nodes/tab-queue). Chúng chia làm hai
 * thiết kế khác nhau:
 *
 *   A — bọc `<Card className="gap-3">`, token DSVH, cỡ chữ 13.5/28/12.5px.
 *       Dùng ở dashboard · admin-plans · backups — tức ĐÂY là cái đang hiển thị trên màn.
 *   B — `<div>` thô + token SHADCN (`bg-card`, `border-border`, `text-muted-foreground`,
 *       `bg-primary/10`) + icon lucide. Dùng ở shared/ và tab-queue.
 *
 * Chọn A làm bản chuẩn: nó đã đúng hệ token, và là cái người dùng đang nhìn thấy. B ngoài việc sai
 * hệ token còn hover ra `--primary` = #2563eb (XANH DƯƠNG) giữa một design system accent cam.
 * Chuyển B → A là sửa lỗi, không phải đổi thiết kế.
 */
export interface StatCardProps {
  /** Component icon của DSVH (`@/components/dsvh/icons`, Phosphor) — KHÔNG dùng lucide. */
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  desc: string;
  /** Đang tải số liệu — hiện Skeleton thay cho số, giữ nguyên chiều cao ô để layout không nhảy. */
  loading?: boolean;
  /**
   * Tô màu con số khi nó mang nghĩa xấu (vd số job thất bại > 0). Mặc định `text-ink`.
   *
   * Là enum chứ KHÔNG nhận className thô: bản cũ ở `tab-queue` truyền thẳng `"text-destructive"`
   * (token shadcn) — mở cửa cho mọi màu lọt vào, đúng thứ hệ token sinh ra để chặn.
   */
  tone?: "default" | "danger" | "success";
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-ink",
  danger: "text-red",
  success: "text-teal",
};

export function StatCard({ icon: Icon, label, value, desc, loading, tone = "default" }: StatCardProps) {
  return (
    <Card className="gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-body font-medium text-ink-2">{label}</span>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-stroke-soft text-ink-2">
          <Icon size={18} />
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        // `tabular-nums`: số KPI đổi liên tục (poll), chữ số không đều bề ngang làm cả ô nhảy qua
        // nhảy lại — thấy rõ nhất ở hàng nghìn.
        <span className={`text-kpi font-bold leading-none tracking-tight tabular-nums ${TONE[tone]}`}>{value}</span>
      )}
      <span className="truncate text-caption text-ink-3">{desc}</span>
    </Card>
  );
}
