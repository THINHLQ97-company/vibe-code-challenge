import type { ComponentType, ReactNode } from "react";

import { Progress } from "@/components/dsvh/ui/Progress";

/**
 * Ô NHÃN + GIÁ TRỊ nằm TRONG một thẻ — khối nhỏ nhất của một bảng thông số.
 *
 * ĐƯA VÀO DSVH 20/08/2026 theo yêu cầu chủ dự án, sau khi đếm được khuôn
 * `rounded-lg border border-stroke bg-surface-2|stroke-soft/40 p-*` viết tay ở **26 chỗ / 21 tệp**.
 * Chúng cùng một hình dạng nhưng lệch nhau ở gần như mọi chi tiết đo được: nền `bg-surface-2` ↔
 * `bg-stroke-soft/40`, đệm `p-3` ↔ `px-3 py-2`, ô icon có/không có khung `size-8 rounded-lg`, nhãn
 * `text-caption text-ink-3` ↔ `text-body font-medium`.
 *
 * KHÁC `StatCard` — đừng thay nhau:
 *   · `StatCard` là ô KPI CẤP TRANG, tự bọc `Card`, đứng thành hàng ngay dưới `PageHeader`.
 *   · `InfoTile` sống BÊN TRONG một `Card` đã có, mô tả một thuộc tính của chính thẻ đó.
 * Nhét `StatCard` vào trong `Card` là lồng hai bề mặt trắng có viền vào nhau.
 *
 * ── HAI BỐ CỤC, VÌ CÓ HAI CÁCH ĐỌC THẬT ─────────────────────────────────────────────────────
 *
 *   `stack` (mặc định) — nhãn nhỏ ở trên, giá trị đậm ở dưới. Dùng khi các ô xếp LƯỚI và người
 *     đọc quét theo CỘT giữa nhiều thẻ (vd bốn ô hạn mức ở /admin/plans: so RAM gói A với RAM gói
 *     B). Giá trị thẳng hàng nhau theo chiều dọc nên so được bằng mắt.
 *   `row` — nhãn trái, giá trị phải, có thể kèm thanh đo bên dưới. Dùng khi ô là MỘT PHÉP ĐO có
 *     mẫu số (vd CPU 42% ở /admin/nodes): mắt đi từ tên chỉ số sang con số rồi xuống thanh.
 *
 * `progress` chỉ có nghĩa ở `row`: một thanh đo cần chiều ngang, còn `stack` thì giá trị đã chiếm
 * chỗ đó. Truyền `progress` kèm `stack` là lỗi dùng sai, không phải một biến thể.
 */
export interface InfoTileProps {
  /** Icon DSVH (`@/components/dsvh/icons`). Bỏ trống khi ô không cần dấu nhận biết. */
  icon?: ComponentType<{ size?: number; className?: string }>;
  label: string;
  /** `ReactNode` chứ không chỉ chuỗi: ô Mạng ở /admin/nodes ghép hai con số lên/xuống có màu riêng. */
  value: ReactNode;
  /**
   * Thanh đo 0–100 dưới giá trị. `null` = CHƯA ĐO ĐƯỢC (vẽ thanh rỗng), `undefined` = ô này vốn
   * không có thanh. Hai thứ khác nhau: một cái là "chưa có số", cái kia là "không áp dụng".
   */
  progress?: number | null;
  /** Tone của thanh đo — cùng bảng với `Progress`. */
  progressTone?: "orange" | "teal" | "amber" | "red";
  layout?: "stack" | "row";
  /**
   * Giá trị XUỐNG DÒNG thay vì bị cắt. Mặc định `false` — cắt giữ cho các ô trong lưới cao bằng
   * nhau, và phần lớn giá trị ở đây ngắn (số, dung lượng).
   *
   * Bật khi giá trị là thứ người dùng phải đọc TRỌN và không đoán được phần bị cắt: địa chỉ kết
   * nối, mã dịch vụ, đường dẫn. Cắt một `host:port` là giấu đúng thứ người ta mở ô đó ra để lấy.
   */
  wrap?: boolean;
  className?: string;
}

export function InfoTile({
  icon: Icon,
  label,
  value,
  progress,
  progressTone,
  layout = "stack",
  wrap = false,
  className = "",
}: InfoTileProps) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-stroke bg-surface-2 p-3 ${className}`}>
      {Icon ? <Icon size={16} className="shrink-0 text-ink-3" /> : null}
      {layout === "stack" ? (
        <div className="min-w-0">
          <p className="truncate text-caption text-ink-3">{label}</p>
          {/* `tabular-nums` mặc định: gần như mọi giá trị ở đây là số, và các ô xếp lưới nên chữ số
              phải thẳng cột giữa các thẻ — thiếu nó thì "16 core" và "8 core" lệch nhau vài pixel. */}
          <p className={`text-body font-medium tabular-nums text-ink ${wrap ? "break-all" : "truncate"}`}>{value}</p>
        </div>
      ) : (
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-body">
            <span className="truncate font-medium text-ink">{label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">{value}</span>
          </div>
          {progress !== undefined ? <Progress value={progress ?? 0} tone={progressTone} /> : null}
        </div>
      )}
    </div>
  );
}
