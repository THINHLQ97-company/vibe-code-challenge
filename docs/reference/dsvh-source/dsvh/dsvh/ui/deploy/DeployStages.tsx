"use client";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import {
  CheckCircleIcon,
  CircleIcon,
  SpinnerIcon,
  WarningCircleIcon,
} from "@/components/dsvh/icons";
import { Badge } from "@/components/dsvh/ui/Badge";
import { Progress } from "@/components/dsvh/ui/Progress";
import { cn } from "@/lib/utils";

/**
 * DANH SÁCH CHẶNG TRIỂN KHAI — một nguồn duy nhất cho mọi màn "đang dựng website".
 *
 * Vì sao có file này (13/08/2026): trước đây `/deploy` và `/templates` mỗi bên tự dựng lấy danh sách
 * chặng. Chủ dự án nhìn hai màn cạnh nhau và thấy ngay chúng KHÁC nhau — cùng một việc, hai bộ mặt:
 *
 *   |              | /deploy                  | /templates (bản cũ)          |
 *   | icon đang chạy | `SpinnerIcon`          | `ArrowClockwiseIcon`         |
 *   | icon xong      | `text-success`         | `text-teal`                  |
 *   | icon chờ       | `text-ink-2/40`        | `text-ink-3 opacity-40`      |
 *   | khe giữa chặng | `space-y-4`            | `space-y-3`                  |
 *   | tiêu đề        | 2 dòng (title + phụ)   | 1 dòng `text-body`           |
 *   | chặng chờ      | có câu "Chưa bắt đầu"  | không có                     |
 *   | khung          | không bọc              | bọc trong `Card`             |
 *
 * Không ai cố tình làm khác — chỉ là chép tay lần hai thì lệch. Đây đúng là căn bệnh đã tái đi tái
 * lại trong kho này (EmptyState, Label, LogConsole, Collapsible): thứ đã tồn tại ở một màn, màn sau
 * không biết nên dựng lại bản của mình. Cách chữa duy nhất có hiệu lực là đưa nó vào DSVH rồi để
 * `ds:check` gác — chứ không phải sửa cho giống nhau một lần nữa.
 *
 * KHÔNG tự bọc khung. Khối này là NỘI DUNG CHÍNH của màn đang dựng, không phải một thẻ nép trong
 * trang; trang gọi tự quyết có bọc `Card` hay không (cả hai màn hiện đều không bọc).
 *
 * KHÔNG tự tính trạng thái. Mỗi màn có nguồn sự thật riêng — `/deploy` còn đối chiếu bước chạy thật
 * từ `DeploymentStage` để thắng phần trăm ước lượng. Component chỉ VẼ đúng thứ được đưa vào.
 */
export type DeployStageStatus = "done" | "active" | "pending" | "failed";

export interface DeployStageItem {
  key: string;
  label: string;
  status: DeployStageStatus;
  /** Dòng mô tả dưới nhãn — tên bước đang chạy, lý do hỏng, hoặc câu mô tả cố định. */
  subline?: ReactNode;
  /**
   * Khối phụ dán vào riêng chặng này (vd "AI đang sửa lỗi", lý do AI dừng). Có mặt thì `subline` bị
   * ẩn — hai thứ cùng chỗ, cùng vai; chồng nhau chỉ tổ rối.
   */
  extra?: ReactNode;
}

export interface DeployStagesProps {
  items: DeployStageItem[];
  /** Tiêu đề khối. Bỏ trống thì không có phần đầu. */
  title?: string;
  /** Dòng phụ dưới tiêu đề — chỗ nói rõ deploy chạy NỀN, đóng trang cũng không sao. */
  subtitle?: string;
  /** Có truyền thì hiện thanh tiến độ ở cuối. */
  progress?: number;
  /** Câu chữ — bỏ trống thì dùng mặc định tiếng Việt, cùng lối với `SubdomainInput`. */
  labels?: Partial<StageLabels>;
  className?: string;
}

/** Khoá i18n cho câu mặc định. Prop `labels` vẫn đè được từng câu như trước. */
const LABEL_KEY = {
  running: "ds.stage_running",
  failed: "ds.stage_failed",
  /** Chỉ trình đọc màn hình nghe — icon tick đã nói với người nhìn rồi. */
  doneSr: "ds.stage_done_sr",
  pending: "ds.stage_pending",
};
type StageLabels = Record<keyof typeof LABEL_KEY, string>;

const STAGE_ICON = {
  failed: WarningCircleIcon,
  done: CheckCircleIcon,
  active: SpinnerIcon,
  pending: CircleIcon,
} as const;

export function DeployStages({
  items,
  title,
  subtitle,
  progress,
  labels,
  className,
}: DeployStagesProps) {
  const { t } = useTranslation();
  // Dựng câu mặc định TỪ i18n rồi mới để `labels` đè lên — giữ nguyên hợp đồng cũ của prop.
  const L: StageLabels = {
    running: labels?.running ?? t(LABEL_KEY.running),
    failed: labels?.failed ?? t(LABEL_KEY.failed),
    doneSr: labels?.doneSr ?? t(LABEL_KEY.doneSr),
    pending: labels?.pending ?? t(LABEL_KEY.pending),
  };

  return (
    <div className={cn("space-y-5 py-4", className)}>
      {title && (
        <div className="space-y-0.5">
          <p className="text-title font-semibold">{title}</p>
          {subtitle && <p className="text-body text-ink-2">{subtitle}</p>}
        </div>
      )}

      <ul className="space-y-4">
        {items.map((st) => {
          const Icon = STAGE_ICON[st.status];
          /**
           * Chặng chờ LUÔN có một dòng nói nó đang chờ, kể cả khi màn gọi không truyền gì. Bỏ trống
           * thì ba chặng chờ chỉ còn ba dòng chữ xám không lời giải thích — người dùng không phân biệt
           * được "chưa tới lượt" với "đã bỏ qua". `/deploy` vốn đã điền câu này; `/templates` thì
           * không, và đó chính là một trong những chỗ hai màn lệch nhau.
           */
          const subline = st.subline ?? (st.status === "pending" ? L.pending : undefined);
          return (
            <li key={st.key} className="flex gap-3">
              <Icon
                className={cn(
                  "mt-0.5 size-5 shrink-0",
                  st.status === "done" && "text-success",
                  st.status === "active" && "animate-spin text-orange",
                  st.status === "failed" && "text-red",
                  st.status === "pending" && "text-ink-2/40",
                )}
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-body",
                      st.status === "pending" ? "text-ink-2" : "font-medium",
                      st.status === "failed" && "text-red",
                    )}
                  >
                    {st.label}
                  </span>
                  {st.status === "active" && (
                    <Badge tone="neutral" className="h-5 border-orange/20 bg-orange/10 px-1.5 text-micro font-medium text-orange">
                      {L.running}
                    </Badge>
                  )}
                  {st.status === "failed" && (
                    <Badge tone="neutral" className="h-5 border-red/20 bg-red/10 px-1.5 text-micro font-medium text-red">
                      {L.failed}
                    </Badge>
                  )}
                  {st.status === "done" && <span className="sr-only">{L.doneSr}</span>}
                </div>

                {/* `aria-live` để trình đọc màn hình đọc lại khi chặng đổi mô tả — người dùng khiếm
                    thị không thấy spinner quay, dòng này là thứ duy nhất báo "vẫn đang chạy". */}
                {st.extra
                  ? st.extra
                  : subline && (
                      <p
                        className={cn("text-caption", st.status === "failed" ? "text-red" : "text-ink-2")}
                        aria-live="polite"
                      >
                        {subline}
                      </p>
                    )}
              </div>
            </li>
          );
        })}
      </ul>

      {progress != null && <Progress value={progress} showValue />}
    </div>
  );
}
