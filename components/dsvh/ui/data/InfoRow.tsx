import type { ReactNode, ComponentType } from "react";
import { tv } from "../../tv";

/**
 * HÀNG NHÃN ↔ GIÁ TRỊ CHỈ-ĐỌC — bản chính, không khung.
 *
 * ĐƯA VÀO DSVH 26/08/2026, đóng mục "Hàng NHÃN/GIÁ TRỊ chỉ-đọc" trong sổ thiếu (mở 19/08). Sổ ghi
 * rõ chưa dựng ngay vì phải chốt ba thứ, và chốt sai thì mọi nơi gọi phải sửa lại lần nữa. Nay có
 * BA bản viết tay để đứng cạnh nhau mà chốt, thay vì đoán từ một phía:
 *
 *   · `InfoRow` — `modules/profile/shared.tsx` — xếp NGANG, có icon, nhãn `text-body text-ink-3`.
 *   · `Muc`     — `modules/admin-service-expiry` — xếp DỌC, không icon, nhãn `text-meta`.
 *   · `Row`     — `modules/admin-nodes/tab-overview` — xếp NGANG, không icon, KHÔNG khai cỡ chữ.
 *
 * Ba quyết định, theo đúng thứ đo được:
 *
 *   (a) `layout` là một prop, mặc định `"row"` — 2/3 nơi gọi xếp ngang. Bản `stack` giữ cho ngăn
 *       kéo hai cột, nơi nhãn dài mà bề ngang hẹp.
 *   (b) `icon` TUỲ CHỌN — 1/3 nơi gọi dùng. Ngăn kéo hạn dịch vụ có 10 mục; gắn icon cho cả 10 là
 *       nhiễu, đúng như sổ thiếu đã lường.
 *   (c) `numeric` do nơi gọi khai, KHÔNG tự bật. Hai nơi đang khai tay (`mono`), và `tabular-nums`
 *       ép lên chữ thường (địa chỉ, tên miền) làm đổi hình chữ mà không được gì.
 *
 * ── VÌ SAO KHÔNG DÙNG `InfoTile` ────────────────────────────────────────────────────────────
 *
 * `InfoTile` tự mang `rounded-lg border bg-surface-2 p-3`. Bốn hàng danh tính trong một `Card` sẽ
 * thành bốn khung trong một khung — đúng lỗi mà gate FRAMENEST vừa dựng ra để chặn. Ranh giới gọn:
 * ô ĐỨNG RIÊNG trong lưới ⇒ `InfoTile`; hàng NẰM TRONG một thẻ đã có khung ⇒ `InfoRow`.
 *
 * ── CỠ CHỮ LÀ PHẦN QUAN TRỌNG NHẤT CỦA COMPONENT NÀY ───────────────────────────────────────
 *
 * Bản `Row` ở /admin/nodes không đặt class cỡ nào cả. Nghe như một thiếu sót vô hại, nhưng đo trên
 * app thật (26/08): chữ KHÔNG có class cỡ render ra **16px** — vì không chỗ nào đặt cỡ nền cho
 * `body`, nên nó rơi về mặc định của trình duyệt. 16px đúng bằng `text-title`, cỡ dành riêng cho
 * TIÊU ĐỀ thẻ. Hệ quả: giá trị trong thẻ Danh tính to ngang tiêu đề thẻ, và hàng UUID (chỗ duy
 * nhất có `text-body`) lại là 14px — bốn hàng cùng một thẻ mà hai cỡ khác nhau.
 *
 * Nên ở đây cỡ chữ do COMPONENT quyết, nơi gọi không truyền vào được: nhãn `text-caption`, giá trị
 * `text-body` — cùng cặp `InfoTile` đang dùng, để một ô và một hàng đọc ra cùng một hệ.
 *
 * ── PHẢI NẰM TRONG MỘT `<dl>` ──────────────────────────────────────────────────────────────
 *
 * Component phát `<dt>`/`<dd>` bọc trong một `<div>` (HTML5 cho phép `div` gộp cặp bên trong `dl`).
 * Một cặp nhãn ↔ giá trị ĐÚNG là một danh sách mô tả: trình đọc màn hình đọc ra "Địa chỉ, giá trị
 * là …" thay vì hai mẩu chữ rời. Hai nơi gọi cũ đã bọc `<dl>` sẵn; chỗ thứ ba (`/admin/nodes`) thì
 * chưa — nên lượt này nó được nâng lên, không phải hạ xuống.
 */
export const infoRowVariants = tv({
  base: "flex min-w-0 gap-3",
  variants: {
    layout: {
      row: "items-center justify-between",
      stack: "flex-col gap-0.5",
    },
  },
  defaultVariants: {
    layout: "row",
  },
});

export interface InfoRowProps {
  /** Icon DSVH (`@/components/dsvh/icons`). Bỏ trống khi hàng không cần dấu nhận biết. */
  icon?: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: ReactNode;
  /** `"row"` (mặc định) nhãn trái ↔ giá trị phải · `"stack"` nhãn trên, giá trị dưới. */
  layout?: "row" | "stack";
  /**
   * `"md"` (mặc định) giá trị `text-body` · `"sm"` giá trị `text-caption` — cả hai đều là BẬC CÓ
   * SẴN trong thang 8 bậc, nơi gọi chỉ được chọn giữa hai, không truyền class cỡ vào được.
   *
   * Thêm 08/09/2026 cho cụm mốc thời gian ở HÀNG TIÊU ĐỀ thẻ (trang chi tiết cơ sở dữ liệu). Ở đó
   * `text-body` làm giá trị to ngang chữ trong thân thẻ, trong khi nó chỉ là siêu dữ liệu về cái
   * thẻ — đúng thứ tầng bậc mà việc đưa nó lên hàng tiêu đề định tạo ra.
   *
   * KHÔNG mở thành prop `className` hay `size` tự do: nguy cơ mà component này sinh ra để bịt là
   * chữ KHÔNG khai cỡ rơi về 16px mặc định của trình duyệt (đo ở `/admin/nodes` 26/08). Một tập
   * đóng hai phần tử không mở lại lỗ đó — cỡ vẫn do component quyết, nơi gọi chỉ chọn vai.
   */
  size?: "md" | "sm";
  /** Bật `tabular-nums` cho giá trị — dùng khi giá trị là SỐ, mã, hoặc ngày giờ. */
  numeric?: boolean;
  /**
   * Giá trị XUỐNG DÒNG thay vì bị cắt. Bật khi giá trị là thứ phải đọc TRỌN và không đoán được
   * phần bị cắt: UUID, địa chỉ kết nối, đường dẫn.
   */
  wrap?: boolean;
  className?: string;
}

export function InfoRow({
  icon: Icon,
  label,
  value,
  layout = "row",
  size = "md",
  numeric = false,
  wrap = false,
  className = "",
}: InfoRowProps) {
  const laChu = typeof value === "string" || typeof value === "number";
  return (
    <div className={infoRowVariants({ layout, className })}>
      {/* NHÃN KHÔNG ĐƯỢC XUỐNG DÒNG (luật 11). Đo 06/08 ở màn hồ sơ: thiếu `shrink-0` thì flex co
          nhãn lại khi giá trị bên phải dài — "ID tài khoản" vỡ thành "ID tài / khoản" ngay khi
          thêm nút sao chép vào cùng hàng. Phần phải co là GIÁ TRỊ, không phải nhãn. */}
      <dt className="flex shrink-0 items-center gap-2 whitespace-nowrap text-caption text-ink-3">
        {Icon ? <Icon size={14} className="shrink-0 text-ink-3" /> : null}
        {label}
      </dt>
      {/* CHỈ CẮT KHI GIÁ TRỊ LÀ CHỮ. `truncate` = `overflow:hidden` + `white-space:nowrap` +
          `text-overflow:ellipsis` — đúng cho một chuỗi dài, nhưng đặt lên một `Badge` hay một cụm
          nút thì nó cắt cụt chính phần tử đó khi thẻ hẹp lại, và cắt một huy hiệu trạng thái là
          giấu đúng thứ người ta mở màn ra để xem. Phần tử React do NƠI GỌI tự lo bề ngang. */}
      <dd
        className={`min-w-0 font-medium text-ink ${size === "sm" ? "text-caption" : "text-body"} ${
          layout === "row" ? "text-right" : ""
        } ${numeric ? "tabular-nums" : ""} ${laChu ? (wrap ? "break-all" : "truncate") : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
