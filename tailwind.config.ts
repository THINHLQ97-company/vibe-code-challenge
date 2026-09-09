import type { Config } from "tailwindcss";

/**
 * DSVH token → Tailwind utility. NGUỒN SỰ THẬT: DSVH.html (mục Token).
 * Tên utility giữ NGUYÊN như tài liệu: bg-surface, text-ink-2, border-stroke,
 * text-orange, text-body, rounded-card…
 */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",
        "surface-hover": "var(--color-surface-hover)",

        ink: "var(--color-ink)",
        "ink-2": "var(--color-ink-2)",
        "ink-3": "var(--color-ink-3)",

        stroke: "var(--color-stroke)",
        "stroke-soft": "var(--color-stroke-soft)",
        "stroke-hover": "var(--color-stroke-hover)",
        "stroke-strong": "var(--color-stroke-strong)",
        "stroke-focus": "var(--color-stroke-focus)",

        cream: "var(--color-cream)",
        "cream-100": "var(--color-cream-100)",
        "cream-200": "var(--color-cream-200)",
        "cream-300": "var(--color-cream-300)",
        "cream-ink": "var(--color-cream-ink)",

        orange: "var(--color-orange)",
        "orange-bright": "var(--color-orange-bright)",
        "orange-strong": "var(--color-orange-strong)",
        red: "var(--color-red)",
        "red-strong": "var(--color-red-strong)",
        amber: "var(--color-amber)",
        "amber-strong": "var(--color-amber-strong)",
        peach: "var(--color-peach)",
        yellow: "var(--color-yellow)",
        teal: "var(--color-teal)",
        "teal-strong": "var(--color-teal-strong)",
        mint: "var(--color-mint)",
        magenta: "var(--color-magenta)",
        link: "var(--color-link)",
        "link-hover": "var(--color-link-hover)",
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
    },
  },
  plugins: [],
} satisfies Config;
