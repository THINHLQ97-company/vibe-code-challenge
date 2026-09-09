// ⚠️ FILE SINH TỰ ĐỘNG — ĐỪNG SỬA TAY.
// Nguồn: src/styles/dsvh-tokens.css · Sinh lại: npm run ds:tokens
// Gate TOKENSDOC trong ds:check sẽ fail nếu file này lệch với CSS.

export type TokenKind = "color" | "radius" | "text";

export type TokenEntry = {
  /** tên biến CSS, vd "color-ink-2" */
  name: string;
  /** cách gõ trong code, vd "ink-2" (bg-ink-2 / text-ink-2) hoặc "rounded-card" */
  utility: string;
  /** giá trị đã giải var() ở theme sáng */
  light: string;
  /** giá trị ở theme tối — null = dùng chung với sáng (brand/accent giữ nguyên hue) */
  dark: string | null;
  kind: TokenKind;
};

export type TokenGroup = { label: string; tokens: TokenEntry[] };

export const tokenGroups: TokenGroup[] = [
  {
    "label": "Surfaces",
    "tokens": [
      {
        "name": "color-canvas",
        "utility": "canvas",
        "light": "#212230",
        "dark": "#0e0f14",
        "kind": "color"
      },
      {
        "name": "color-surface",
        "utility": "surface",
        "light": "#ffffff",
        "dark": "#1a1b23",
        "kind": "color"
      },
      {
        "name": "color-surface-2",
        "utility": "surface-2",
        "light": "#fcfeff",
        "dark": "#22232e",
        "kind": "color"
      }
    ]
  },
  {
    "label": "Ink / text",
    "tokens": [
      {
        "name": "color-ink",
        "utility": "ink",
        "light": "#001d21",
        "dark": "#eef1f2",
        "kind": "color"
      },
      {
        "name": "color-ink-2",
        "utility": "ink-2",
        "light": "#334a4d",
        "dark": "#aeb6b8",
        "kind": "color"
      },
      {
        "name": "color-ink-3",
        "utility": "ink-3",
        "light": "#64797c",
        "dark": "#78838a",
        "kind": "color"
      }
    ]
  },
  {
    "label": "Lines",
    "tokens": [
      {
        "name": "color-stroke",
        "utility": "stroke",
        "light": "#dfe6e6",
        "dark": "#2d2f3d",
        "kind": "color"
      },
      {
        "name": "color-stroke-soft",
        "utility": "stroke-soft",
        "light": "#eef2f2",
        "dark": "#24252f",
        "kind": "color"
      },
      {
        "name": "color-stroke-hover",
        "utility": "stroke-hover",
        "light": "#d3dede",
        "dark": "#3a3d4d",
        "kind": "color"
      },
      {
        "name": "color-stroke-strong",
        "utility": "stroke-strong",
        "light": "#cdd7d7",
        "dark": "#454859",
        "kind": "color"
      },
      {
        "name": "color-stroke-focus",
        "utility": "stroke-focus",
        "light": "#c3d0d0",
        "dark": "#565a78",
        "kind": "color"
      },
      {
        "name": "color-surface-hover",
        "utility": "surface-hover",
        "light": "#e4eaea",
        "dark": "#2c2e3a",
        "kind": "color"
      }
    ]
  },
  {
    "label": "Cream",
    "tokens": [
      {
        "name": "color-cream",
        "utility": "cream",
        "light": "#fff3e0",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-cream-100",
        "utility": "cream-100",
        "light": "#fbf3e6",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-cream-200",
        "utility": "cream-200",
        "light": "#f7ecda",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-cream-300",
        "utility": "cream-300",
        "light": "#f0e6d8",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-cream-ink",
        "utility": "cream-ink",
        "light": "#001d21",
        "dark": null,
        "kind": "color"
      }
    ]
  },
  {
    "label": "Brand + data accents",
    "tokens": [
      {
        "name": "color-orange",
        "utility": "orange",
        "light": "#de4400",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-orange-bright",
        "utility": "orange-bright",
        "light": "#f5872a",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-orange-strong",
        "utility": "orange-strong",
        "light": "#cf3e00",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-red",
        "utility": "red",
        "light": "#d92d20",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-red-strong",
        "utility": "red-strong",
        "light": "#b42318",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-amber",
        "utility": "amber",
        "light": "#f59e0b",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-amber-strong",
        "utility": "amber-strong",
        "light": "#b45309",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-peach",
        "utility": "peach",
        "light": "#ffd8a8",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-yellow",
        "utility": "yellow",
        "light": "#ffc84c",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-teal",
        "utility": "teal",
        "light": "#21b37a",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-teal-strong",
        "utility": "teal-strong",
        "light": "#0f7a52",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-mint",
        "utility": "mint",
        "light": "#86f2c8",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-magenta",
        "utility": "magenta",
        "light": "#e879c7",
        "dark": null,
        "kind": "color"
      },
      {
        "name": "color-link",
        "utility": "link",
        "light": "#0b6bcb",
        "dark": "#6bb6ff",
        "kind": "color"
      },
      {
        "name": "color-link-hover",
        "utility": "link-hover",
        "light": "#08529c",
        "dark": "#9acbff",
        "kind": "color"
      }
    ]
  },
  {
    "label": "Thang chữ",
    "tokens": [
      {
        "name": "text-micro",
        "utility": "text-micro",
        "light": "10px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-meta",
        "utility": "text-meta",
        "light": "11px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-caption",
        "utility": "text-caption",
        "light": "12px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-body",
        "utility": "text-body",
        "light": "14px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-title",
        "utility": "text-title",
        "light": "16px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-page",
        "utility": "text-page",
        "light": "24px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-kpi",
        "utility": "text-kpi",
        "light": "28px",
        "dark": null,
        "kind": "text"
      },
      {
        "name": "text-hero",
        "utility": "text-hero",
        "light": "34px",
        "dark": null,
        "kind": "text"
      }
    ]
  },
  {
    "label": "Bo góc",
    "tokens": [
      {
        "name": "radius-card",
        "utility": "rounded-card",
        "light": "16px",
        "dark": null,
        "kind": "radius"
      }
    ]
  }
];

export const tokenCount = 41;
