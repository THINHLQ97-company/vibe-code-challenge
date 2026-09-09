import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * DSVH token → Tailwind utility. NGUỒN SỰ THẬT: DSVH.html (mục Token).
 * Tên utility giữ NGUYÊN như tài liệu: bg-surface, text-ink-2, border-stroke,
 * text-orange, text-body, rounded-card…
 */

/**
 * Token phải khai bằng HÀM, không phải chuỗi var() thuần.
 *
 * Với chuỗi var() thuần, Tailwind không biết tách kênh màu để chèn alpha, nên nó BỎ HẲN mọi
 * class có hậu tố opacity — không báo lỗi, không sinh CSS. Đo trên bản build trước: 89 class kiểu
 * `bg-ink/30`, `ring-orange/30`, `bg-teal/12` đều không có một dòng CSS nào. Hậu quả thấy được:
 * modal mất nền mờ, toàn bộ focus ring biến mất, nền badge trạng thái mất, và cột điều hướng
 * (`text-cream/70`) không có thuộc tính color nên thừa hưởng chữ `ink` tối → chữ tối trên nền
 * `canvas` tối, gần như vô hình.
 *
 * `color-mix` giữ nguyên biến hex trong globals.css, nên các component DSVH đang dùng thẳng
 * `var(--color-*)` trong style nội tuyến vẫn chạy y như cũ.
 */
const token = (name: string) =>
  // Tailwind CHẤP NHẬN hàm ở đây lúc chạy, nhưng kiểu `Config` chỉ khai `string`. Ép kiểu ngay
  // tại chỗ để phần còn lại của config vẫn được TypeScript kiểm, thay vì nới lỏng cả object.
  (({ opacityValue }: { opacityValue?: string }) =>
    opacityValue === undefined
      ? `var(--color-${name})`
      : `color-mix(in srgb, var(--color-${name}) calc(${opacityValue} * 100%), transparent)`) as unknown as string;

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        "surface-2": token("surface-2"),
        "surface-hover": token("surface-hover"),

        ink: token("ink"),
        "ink-2": token("ink-2"),
        "ink-3": token("ink-3"),

        stroke: token("stroke"),
        "stroke-soft": token("stroke-soft"),
        "stroke-hover": token("stroke-hover"),
        "stroke-strong": token("stroke-strong"),
        "stroke-focus": token("stroke-focus"),

        cream: token("cream"),
        "cream-100": token("cream-100"),
        "cream-200": token("cream-200"),
        "cream-300": token("cream-300"),
        "cream-ink": token("cream-ink"),

        orange: token("orange"),
        "orange-bright": token("orange-bright"),
        "orange-strong": token("orange-strong"),
        red: token("red"),
        "red-strong": token("red-strong"),
        amber: token("amber"),
        "amber-strong": token("amber-strong"),
        peach: token("peach"),
        yellow: token("yellow"),
        teal: token("teal"),
        "teal-strong": token("teal-strong"),
        mint: token("mint"),
        magenta: token("magenta"),
        link: token("link"),
        "link-hover": token("link-hover"),
      },
      fontSize: {
        micro: "var(--text-micro)",
        meta: "var(--text-meta)",
        caption: "var(--text-caption)",
        body: "var(--text-body)",
        title: "var(--text-title)",
        page: "var(--text-page)",
        kpi: "var(--text-kpi)",
        hero: "var(--text-hero)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      /**
       * Thang opacity mặc định của Tailwind nhảy bậc 5 rồi 10 (…,10,20,25,30,…) nên KHÔNG có 12,
       * 15, 85 — mà DSVH dùng đúng ba bậc đó cho nền huy hiệu trạng thái (`bg-teal/12` ở
       * `status.ts`), viền ô nhập lỗi và lớp phủ. Class lệch thang bị bỏ im lặng, không báo lỗi:
       * `Badge tone="success"` mất hẳn nền xanh và trở thành chữ trần.
       */
      opacity: {
        12: "0.12",
        15: "0.15",
        85: "0.85",
      },
      /**
       * `shadow-xs` là bậc của Tailwind v4; repo này chạy v3 nên class đó không sinh CSS và
       * `Kbd`/`FileUpload` của DSVH mất hẳn đổ bóng. Khai lại đúng giá trị v4.
       */
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
    },
  },
  plugins: [
    /**
     * `scrollbar-thin` là class của plugin `tailwind-scrollbar`, mà repo này không cài (chính sách
     * `minimumReleaseAge` — thêm một phụ thuộc chỉ để lấy một class là không đáng). `Table` của
     * DSVH dùng nó cho khung cuộn khi có `maxHeight`; thiếu nó thì thanh cuộn về mặc định to đùng
     * của hệ điều hành, đè lên cột cuối. Khai tay, không thêm phụ thuộc.
     */
    plugin(({ addUtilities }) => {
      addUtilities({
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": { width: "8px", height: "8px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            "background-color": "var(--color-stroke-strong)",
            "border-radius": "9999px",
          },
        },
      });
    }),
  ],
} satisfies Config;
