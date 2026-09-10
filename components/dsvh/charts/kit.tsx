"use client";

import type { ReactNode } from "react";

/**
 * ds-allow-hex-file: Recharts vẽ SVG nên thuộc tính `fill`/`stroke` cần MÀU LITERAL — không nhận
 * class Tailwind. Đây là bản SAO của token, và bản sao thì phải được canh: gate `CHARTKIT` trong
 * `ds:check` đối chiếu từng giá trị dưới đây với token thật trong `tokens-data.ts`, lệch là fail.
 * Đổi token màu → chạy `npm run ds:tokens` rồi sửa bảng này cho khớp.
 */
export const C = {
  orange: "#de4400",
  orangeBright: "#f5872a",
  peach: "#ffd8a8",
  teal: "#21b37a",
  mint: "#86f2c8",
  magenta: "#e879c7",
  unit: "#e9b7dd",
  grid: "#eef2f2",
  tick: "#94a6a8",
  ink: "#001d21",
  ink2: "#334a4d",
  /**
   * BA MÀU TRẠNG THÁI cho biểu đồ — thêm 14/08/2026 khi kéo biểu đồ /admin/reports về kit này.
   *
   * Trước đó kit chỉ có palette THƯƠNG HIỆU (cam/teal/hồng), nên mọi biểu đồ nói chuyện ĐẠT/HỎNG
   * đều phải tự đi đường vòng: /admin/reports khai `--report-ok|failed|pending` riêng trong
   * `design-tokens.css` rồi đọc qua `var(...)`. Đường vòng ấy hợp lệ về token nhưng nằm NGOÀI tầm
   * canh của gate `CHARTKIT`, tức là palette biểu đồ có hai nửa và chỉ một nửa được đối chiếu.
   *
   * `ink3` là màu "ngữ cảnh" — dãy KHÔNG mang tin xấu. Cố ý XÁM chứ không teal: khi trên cùng một
   * biểu đồ có cả "đạt" lẫn "hỏng", tô teal cho đạt là bắt mắt phải phân biệt teal ↔ đỏ, mà hai màu
   * đó chỉ cách nhau ΔE 2,7 dưới mù màu deutan (~8% nam giới) — với họ đó là MỘT màu. Để đạt xám
   * thì chỉ còn đúng một dãy có màu, và bài toán cặp màu biến mất.
   */
  ink3: "#64797c",
  red: "#d92d20",
  amber: "#f59e0b",
  /** Xám nhạt hơn `ink3`, dùng cho dãy "chưa có kết quả" — phân biệt thêm bằng VÂN, không bằng màu. */
  strokeStrong: "#cdd7d7",
  surface: "#ffffff", // active-dot ring / gaps — mirrors --color-surface
};

export const axisTick = { fill: C.tick, fontSize: 10 } as const;

/**
 * Lớp bọc BẮT BUỘC quanh mọi `<ResponsiveContainer>` — thêm 14/08/2026.
 *
 * VÌ SAO PHẢI CÓ: `C` ở trên là palette CỦA THEME SÁNG, viết cứng vì Recharts vẽ SVG và thuộc tính
 * `stroke`/`fill` không nhận `var()`. Ở theme TỐI điều đó thành lỗi thật: `C.grid` = #eef2f2 gần
 * trắng, đặt trên nền #1a1b23 thì lưới sáng hơn cả cột dữ liệu — chụp được ở /admin/reports ngày
 * 14/08, lưới nổi bật hơn chính biểu đồ.
 *
 * Đây là thứ bản shadcn cũ (`ChartContainer`) vẫn làm đúng và dễ mất khi bỏ nó đi: nó không truyền
 * màu qua thuộc tính mà gắn CSS lên các lớp `.recharts-*`, nên màu đi theo theme. Kit nay làm y hệt.
 *
 * CƠ CHẾ: khai báo CSS THẮNG thuộc tính trình bày của SVG. Nên `gridProps.stroke` / `axisTick.fill`
 * ở trên vẫn giữ nguyên vai trò giá trị mặc định (và vẫn được gate `CHARTKIT` canh theo token sáng),
 * còn lớp này mới là bên quyết định lúc chạy — một nguồn cho cả hai theme, không phải hai bảng màu.
 */
export const chartFrame = [
  "[&_.recharts-cartesian-grid_line]:stroke-[var(--color-stroke-soft)]",
  /**
   * Nhắm vào `.recharts-cartesian-axis-tick-value` — chính thẻ `<text>`.
   *
   * Bản đầu viết `.recharts-cartesian-axis-tick text` và KHÔNG ăn: cây thật của Recharts là
   * `g.recharts-cartesian-axis-tick-label > text`, mà `-tick-label` là một TÊN LỚP KHÁC chứ không
   * phải `-tick` lồng thêm, nên tổ tiên trong bộ chọn không bao giờ khớp. Đo ra mới thấy — chữ trục
   * vẫn giữ nguyên #94a6a8 ở cả hai theme trong khi lưới đã đổi đúng.
   */
  "[&_.recharts-cartesian-axis-tick-value]:fill-[var(--color-ink-3)]",
  "[&_.recharts-tooltip-cursor]:fill-[var(--color-stroke-soft)]",
  "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-[var(--color-stroke-strong)]",
].join(" ");

/** Shared grid — horizontal hairlines only, matching the design. */
export const gridProps = {
  vertical: false,
  stroke: C.grid,
  strokeWidth: 1,
} as const;

/** Grey dashed crosshair shown under the tooltip on hover. Dùng cho chart CHỈ có đường/vùng. */
export const cursorLine = {
  stroke: "#cdd7d7",
  strokeWidth: 1,
  strokeDasharray: "3 3",
} as const;

/**
 * Cursor cho biểu đồ CÓ CỘT (`BarChart`, `ComposedChart` có `<Bar>`) — thêm 14/08/2026.
 *
 * Recharts vẽ cursor của chart cột bằng HÌNH CHỮ NHẬT, không phải đường, nên truyền `cursorLine`
 * vào đó là truyền nhầm loại: các thuộc tính `stroke*` được nhận nhưng `fill` thì không, và
 * Recharts rơi về mặc định của chính nó — đo được ở /admin/reports: `fill: #cccccc`,
 * `fill-opacity: 1`, tức một dải xám ĐẶC ngoài hệ token phủ trọn chiều cao biểu đồ, đậm hơn cả cột
 * dữ liệu nó đang chỉ vào.
 *
 * `C.grid` là đúng sắc xám của lưới: đủ để mắt biết đang đứng ở cột nào, không tranh nhìn với dữ liệu.
 */
export const cursorBar = { fill: C.grid } as const;

/**
 * Dựng phần nội dung tooltip cho Recharts từ một mô tả dãy — dùng thẳng ở `<Tooltip content={…}>`.
 *
 * VÌ SAO Ở KIT: `TooltipCard` chỉ là cái vỏ, còn phần dịch `payload` của Recharts sang `rows` thì
 * MỖI BIỂU ĐỒ PHẢI TỰ VIẾT. Đo 14/08/2026: đoạn dịch đó đã bị chép tay 4 lần — một bản trong
 * `demos.tsx` (`ChartTip`, khoá cứng theo `CHART_DATA`) và ba bản arrow function nội tuyến ở
 * `admin-reports`. Bốn bản cùng một logic là bốn chỗ để lệch nhau, và cái vỏ dùng chung không cứu
 * được điều đó vì phần hay sai nằm ở ruột.
 *
 * ĐỌC TỪ `payload[0].payload` — tức HÀNG DỮ LIỆU GỐC, không phải mảng `payload` của Recharts. Hai
 * thứ này khác nhau ở đúng chỗ hay sụp: `payload` chỉ chứa các dãy Recharts CÓ VẼ, nên dãy nào giá
 * trị 0 hoặc bị ẩn sẽ biến mất khỏi tooltip và các dòng còn lại lặng lẽ trượt lên sai nhãn. Đọc
 * theo `key` từ hàng gốc thì thứ tự dòng luôn cố định, và số 0 vẫn hiện ra là 0.
 */
export type ChartTipSeries = {
  /** Tên trường trong hàng dữ liệu gốc. */
  key: string;
  label: string;
  color: string;
  /** Định dạng riêng (vd rút gọn nghìn). Mặc định để nguyên số. */
  format?: (v: number) => ReactNode;
};

/** Hình dạng props Recharts truyền vào `content` — khai theo cấu trúc để kit không phải import recharts. */
type ChartTipProps = {
  active?: boolean;
  label?: string | number;
  /** `readonly`: Recharts khai mảng payload là readonly, không nới ra thì `content` không nhận hàm này. */
  payload?: readonly { payload?: Record<string, unknown> }[];
};

export function chartTooltip(
  series: readonly ChartTipSeries[],
  options: {
    /**
     * Đổi nhãn trục X thành tiêu đề tooltip. Cần khi trục là mốc thời gian ISO: trục vẽ "14:05" cho
     * gọn, nhưng tooltip có chỗ nên phải nói đủ ngày-giờ — nếu không người đọc không biết mình đang
     * xem 14:05 của HÔM NÀO ở một biểu đồ 7 ngày.
     */
    title?: (label: string | number) => ReactNode;
    /** Bỏ dòng có giá trị `null` (chưa đo được) thay vì hiện 0 — xem `ChartTipSeries.key`. */
    hideNull?: boolean;
    /**
     * KHÔNG hiện tooltip khi mọi dãy của điểm đó đều bằng 0/`null` — dùng cho biểu đồ có trục thời
     * gian bù đủ ngày trống.
     *
     * Khác `hideNull` và không thay được cho nhau: `hideNull` xử lý ô `null` (CHƯA ĐO ĐƯỢC), còn ở
     * đây ngày trống là số 0 THẬT do SQL `COALESCE(...,0)` bù vào để trục giữ đủ chỗ. Một sổ 3 lượt
     * trong 30 ngày vì thế có 29 điểm hover chỉ để nói "0 và 0" — nhiễu, và tệ hơn là nó khiến tấm
     * thẻ trông như đang có dữ liệu ở khắp nơi.
     *
     * Chỉ bật ở nơi 0 nghĩa là "không có gì xảy ra". Nơi nào 0 là một kết quả đáng đọc (vd tỉ lệ
     * lỗi bằng 0) thì KHÔNG bật — ở đó giấu tooltip là giấu mất tin tốt.
     */
    hideEmpty?: boolean;
  } = {}
) {
  return function ChartTooltipContent({ active, payload, label }: ChartTipProps) {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload ?? {};
    const rows = series
      .map((s) => {
        const raw = row[s.key];
        // `null` = CHƯA ĐO ĐƯỢC, khác hẳn 0. Giữ đúng luật đã dùng ở mọi ô số khác trong app.
        if (raw == null) return options.hideNull ? null : { color: s.color, label: s.label, value: "—" };
        const v = Number(raw);
        return { color: s.color, label: s.label, value: s.format ? s.format(v) : v };
      })
      .filter((r) => r !== null);
    if (!rows.length) return null;
    if (options.hideEmpty && series.every((s) => !Number(row[s.key] ?? 0))) return null;
    return (
      <TooltipCard
        title={label === undefined ? undefined : options.title ? options.title(label) : String(label)}
        rows={rows}
      />
    );
  };
}

/**
 * Nội dung tooltip cho biểu đồ TRÒN (Pie/Donut) — MỘT dòng, của đúng lát đang trỏ.
 *
 * ── VÌ SAO KHÔNG DÙNG `chartTooltip` (lỗi đo được 19/08) ─────────────────────────────────────
 * `chartTooltip` sinh ra cho biểu đồ NHIỀU DÃY (đường/cột): nó nhận một danh sách `series` và với
 * mỗi cái đọc `row[s.key]`, nghĩa là mỗi dãy có một TRƯỜNG RIÊNG trong hàng dữ liệu.
 *
 * Biểu đồ tròn thì ngược hẳn: mọi lát dùng CHUNG một `dataKey`, cái phân biệt chúng là HÀNG. Ai
 * mượn `chartTooltip` cho Pie sẽ phải truyền N series cùng `key`, và kết quả là trỏ vào MỘT lát mà
 * tooltip hiện N dòng — tất cả cùng một con số nhưng mang N cái tên khác nhau:
 *
 *     Dựng ảnh Docker   12
 *     Nguồn mã          12      ← cả năm dòng đều là số của lát đang trỏ
 *     Lúc chạy & CSDL   12
 *
 * Tức tooltip khai rằng cả năm nhóm đều bằng 12. Không có gì đỏ, không lỗi kiểu — và bộ kiểm dựng
 * tĩnh KHÔNG bắt được vì tooltip chỉ tồn tại lúc rê chuột.
 *
 * Nên đây là hàm riêng chứ không phải một tuỳ chọn của `chartTooltip`: hai loại biểu đồ đọc dữ liệu
 * theo hai hướng vuông góc nhau, gộp lại thì một tham số sẽ phải nói cả hai chuyện.
 */
export function pieTooltip<T>(opts: {
  /** Tên lát — thường là nhãn đã dịch. */
  label: (row: T) => string;
  /** Giá trị hiện bên phải. */
  value: (row: T) => ReactNode;
  /** Màu chấm — phải KHỚP màu `Cell` của chính lát đó, nếu không tooltip trỏ nhầm lát. */
  color: (row: T) => string;
}) {
  return function PieTooltipContent({ active, payload }: ChartTipProps) {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload as T | undefined;
    if (!row) return null;
    return <TooltipCard rows={[{ color: opts.color(row), label: opts.label(row), value: opts.value(row) }]} />;
  };
}

/** Styled floating tooltip card (matches the Figma tooltip chrome). */
export function TooltipCard({
  title,
  rows,
}: {
  /** `ReactNode` chứ không chỉ `string`: tiêu đề có thể là mốc thời gian đã định dạng. */
  title?: ReactNode;
  rows: { color: string; label: string; value: ReactNode }[];
}) {
  return (
    <div className="pointer-events-none min-w-[132px] rounded-xl border border-stroke bg-surface p-2.5 shadow-[0_8px_24px_rgba(10,13,20,0.12)]">
      {title && (
        <p className="mb-1.5 text-caption font-semibold text-ink">{title}</p>
      )}
      <div className="flex flex-col gap-1 text-caption">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-ink-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: r.color }}
              />
              {r.label}
            </span>
            <span className="font-semibold text-ink">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
