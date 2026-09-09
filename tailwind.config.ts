import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Trỏ THẲNG vào token --ds-* của design-system.css (Mắt Bão Mockup Kit) —
        // đặt tên đúng nghĩa gốc, KHÔNG đổi tên/gán lại ý nghĩa khác (vd không có
        // chuyện class "orange" render ra màu indigo).
        background: "var(--ds-bg)",
        foreground: "var(--ds-fg)",
        subtle: "var(--ds-fg-subtle)",
        card: "var(--ds-surface)",
        popover: "var(--ds-surface-overlay)",
        primary: { DEFAULT: "var(--ds-primary)", hover: "var(--ds-primary-hover)", foreground: "#ffffff" },
        secondary: { DEFAULT: "var(--ds-surface-raised)", foreground: "var(--ds-fg)" },
        muted: { DEFAULT: "var(--ds-bg)", foreground: "var(--ds-fg-mute)" },
        accent: { DEFAULT: "var(--ds-primary-light)", foreground: "var(--ds-primary)" },
        destructive: { DEFAULT: "var(--ds-danger)", foreground: "#ffffff" },
        success: "var(--ds-success)",
        "success-bg": "var(--ds-success-bg)",
        warning: "var(--ds-warning)",
        "warning-bg": "var(--ds-warning-bg)",
        info: "var(--ds-info)",
        "info-bg": "var(--ds-info-bg)",
        border: "var(--ds-border)",
        "border-strong": "var(--ds-border-strong)",
        input: "var(--ds-border)",
        ring: "var(--ds-primary-mute)",
      },
      fontSize: {
        xs: "var(--ds-font-size-xs)",
        sm: "var(--ds-font-size-sm)",
        base: "var(--ds-font-size-base)",
        md: "var(--ds-font-size-md)",
        lg: "var(--ds-font-size-lg)",
        xl: "var(--ds-font-size-xl)",
        "2xl": "var(--ds-font-size-2xl)",
      },
      borderRadius: {
        card: "var(--ds-radius-lg)",
        lg: "var(--ds-radius-md)",
        DEFAULT: "var(--ds-radius)",
        sm: "var(--ds-radius-sm)",
        full: "var(--ds-radius-full)",
      },
      boxShadow: {
        xs: "var(--ds-shadow-xs)",
        sm: "var(--ds-shadow-sm)",
        md: "var(--ds-shadow-md)",
        lg: "var(--ds-shadow-lg)",
        xl: "var(--ds-shadow-xl)",
      },
    },
  },
  plugins: [],
} satisfies Config;
