/**
 * ds-allow-hex-file: TOÀN BỘ file này là logo nhận diện thương hiệu (Google, GitLab, Postgres,
 * MySQL, Redis, MongoDB...). Màu hãng là hằng số pháp lý/nhận diện — KHÔNG token hoá, KHÔNG đổi
 * theo theme sáng/tối. Đây là ngoại lệ có chủ đích của luật token-only, không phải nợ kỹ thuật.
 */
/**
 * Brand / logo icons (Google, GitHub, GitLab, Vercel…) — Phosphor không có logo
 * thương hiệu nên đây là ngoại lệ được phép dùng SVG hãng (giữ đúng màu nhận diện).
 * Monochrome (GitHub/Vercel) theo currentColor; đa sắc (Google/GitLab) dùng màu hãng.
 * Nguồn gốc: tách ra từ vibe-host-ui (2026). Nay repo này tự sở hữu.
 */

type BrandIconProps = { size?: number; className?: string; "aria-hidden"?: boolean };

export function GitHubIcon({ size = 20, className, ...rest }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 22.29 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

export function GoogleIcon({ size = 20, className, ...rest }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} {...rest}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 4.75c1.61 0 3.06.55 4.2 1.64l3.15-3.15C17.45 1.44 14.97.5 12 .5 7.7.5 3.99 2.97 2.18 6.06L5.84 8.9C6.71 6.31 9.14 4.75 12 4.75z" />
    </svg>
  );
}

export function GitLabIcon({ size = 20, className, ...rest }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#E24329" className={className} {...rest}>
      <path d="M23.6 9.6l-.03-.08-3.26-8.5a.85.85 0 0 0-.83-.54.83.83 0 0 0-.8.6L16.5 7.5H7.5L5.3 1.08a.83.83 0 0 0-.8-.6.84.84 0 0 0-.83.55L.4 9.52l-.03.08a6.03 6.03 0 0 0 2 6.97l.03.02 4.96 3.72 2.45 1.85 1.49 1.13a.98.98 0 0 0 1.19 0l1.49-1.13 2.45-1.85 4.98-3.73a6.03 6.03 0 0 0 2-6.97z" />
    </svg>
  );
}

export function VercelIcon({ size = 20, className, ...rest }: BrandIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...rest}>
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  );
}

/**
 * Màu nhận diện engine database — dùng cho DBTypeCard (tô DatabaseIcon theo màu
 * hãng). Hex hãng hợp lệ trong file brand (allowlist lint-tokens).
 */
export const DB_BRAND: Record<string, string> = {
  postgres: "#336791",
  mysql: "#00758f",
  redis: "#d82c20",
  mongo: "#00ed64",
};

/* ─── Ứng dụng AI kết nối qua cổng MCP ──────────────────────────────────────────────────────── */

/**
 * BA ỨNG DỤNG AI CHẠY TRÊN MÁY NGƯỜI DÙNG — dùng DẤU CHÍNH HÃNG (13/08/2026).
 *
 * Trước đây đây là ô bo góc mang màu hãng + chữ viết tắt (C · Cx · Ag), vì tôi cố ý KHÔNG vẽ lại
 * logo Anthropic/OpenAI/Google từ trí nhớ — vẽ sai logo người khác còn tệ hơn không vẽ. Nay chủ dự
 * án đã đặt ba tệp SVG chính hãng vào `public/`, nên thay ruột component; bố cục chỗ gọi không đổi,
 * đúng như ghi chú cũ đã liệu trước.
 *
 * KHÔNG lọc màu theo theme. Tôi đã suýt thêm `dark:invert` cho `ChatGPT.svg` vì thấy trong tệp có
 * `fill="black"` — tưởng dấu đen sẽ chìm vào nền tối. RASTERISE RA NHÌN thì ngược lại: cả ba tệp đều
 * tự mang một TẤM NỀN BO GÓC riêng (Claude nền kem `#F0EEE5`, hai tệp kia nền trắng), `fill="black"`
 * chỉ là nét thắt nút NẰM TRÊN tấm nền trắng đó. Đảo màu là lật luôn tấm nền, biến dấu thành một ô
 * đen đặc giữa nền tối — hỏng đúng cái mình định chữa.
 */
export type AiAppId = "claude-code" | "codex" | "antigravity";

export const AI_APPS: {
  id: AiAppId;
  name: string;
  /** Tệp trong `public/` — tên giữ đúng như hãng đặt. */
  src: string;
}[] = [
  { id: "claude-code", name: "Claude Code", src: "/Claude.svg" },
  { id: "codex", name: "Codex", src: "/ChatGPT.svg" },
  { id: "antigravity", name: "Antigravity", src: "/Antigravity.svg" },
];

export function AiAppMark({
  app,
  size = 28,
  className,
}: {
  app: (typeof AI_APPS)[number];
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- dấu hãng là SVG tĩnh trong `public/`;
    // `next/image` không tối ưu được SVG mà lại bắt khai width/height cố định ở mọi chỗ gọi.
    <img
      src={app.src}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className ?? ""}`}
    />
  );
}
