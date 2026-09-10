import type { SVGProps } from "react";

/**
 * Bộ hình vẽ RIÊNG cho trang giới thiệu — SVG viết tay, không dùng icon có sẵn.
 *
 * ── LỆCH LUẬT #5 CỦA DSVH, CÓ CHỦ ĐÍCH ─────────────────────────────────────────────────────
 * DSVH bắt mọi icon đi qua wrapper `icon()` của Phosphor và cấm SVG vẽ tay. Luật đó gác cho các
 * MÀN LÀM VIỆC bên trong app: ở đó icon là ký hiệu chức năng lặp đi lặp lại, tự vẽ mỗi nơi một
 * kiểu là hệ thống rạn ngay. Trang giới thiệu thì khác — nó là mặt tiếp thị, mỗi hình xuất hiện
 * đúng một lần và mang tính nhận diện, nên bộ Phosphor dùng chung khiến trang trông như mọi
 * dashboard khác. Ranh giới đang áp: `app/page.tsx` dùng bộ này; MỌI màn trong `/dashboard` và
 * `/admin` vẫn dùng `components/dsvh/icons`.
 *
 * Cả bộ vẽ trên lưới 24, nét 1,75, đầu và góc bo tròn, `currentColor` — để đứng cạnh nhau đọc ra
 * cùng một bàn tay. Đổi nét hay lưới thì phải đổi cả bộ.
 */

type MarkProps = SVGProps<SVGSVGElement> & { size?: number };

function Mark({ size = 24, children, ...rest }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Tia sáng — nhãn mở đầu, mang nghĩa "làm ra thứ mới". */
export function MarkSpark(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M12 3.2l1.9 5.4 5.4 1.9-5.4 1.9L12 17.8l-1.9-5.4L4.7 10.5l5.4-1.9z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </Mark>
  );
}

/** Ví tiền — hoàn phí công cụ AI qua lương. */
export function MarkWallet(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M3.5 8.8a2.3 2.3 0 0 1 2.3-2.3h12.4a2.3 2.3 0 0 1 2.3 2.3v8.4a2.3 2.3 0 0 1-2.3 2.3H5.8a2.3 2.3 0 0 1-2.3-2.3z" />
      <path d="M3.5 9.4V6.6a2 2 0 0 1 2-2h9.7" />
      <path d="M20.5 11.9h-3.2a1.6 1.6 0 0 0 0 3.2h3.2" />
    </Mark>
  );
}

/** Cột điểm đi lên — bài thi tính vào KPI. */
export function MarkKpi(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M4 4.5v15h16" />
      <path d="M7.8 16.2v-3.4M11.6 16.2v-6.1M15.4 16.2v-2.3M19.2 16.2V8" />
      <path d="M7.8 9.6l3.8-3.4 3.8 2.1L19.6 4" />
    </Mark>
  );
}

/** Con dấu chứng nhận — chứng nhận tham gia, repo vào kho Template. */
export function MarkSeal(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="12" cy="9.5" r="5.6" />
      <path d="M9.6 8.8l1.7 1.7 3.2-3.4" />
      <path d="M8.9 14.3L7.8 21l4.2-2.1L16.2 21l-1.1-6.7" />
    </Mark>
  );
}

/** Khiên cảnh báo — dữ liệu phải là dữ liệu giả. */
export function MarkShieldAlert(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M12 3.2l7.2 2.8v5.4c0 4.2-3 7.7-7.2 8.6-4.2-.9-7.2-4.4-7.2-8.6V6z" />
      <path d="M12 8.4v3.9" />
      <path d="M12 15.1h.01" />
    </Mark>
  );
}

/** Ba tầng dữ liệu — sản phẩm bắt buộc có database chạy thật. */
export function MarkDatabase(p: MarkProps) {
  return (
    <Mark {...p}>
      <ellipse cx="12" cy="6.2" rx="6.8" ry="2.9" />
      <path d="M5.2 6.2v5.6c0 1.6 3 2.9 6.8 2.9s6.8-1.3 6.8-2.9V6.2" />
      <path d="M5.2 11.8v5.6c0 1.6 3 2.9 6.8 2.9s6.8-1.3 6.8-2.9v-5.6" />
    </Mark>
  );
}

/** Sóng lan — đăng bài và đếm tương tác. */
export function MarkBroadcast(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M4 10.2v3.6a1.6 1.6 0 0 0 1.6 1.6h2.2l5.6 3.7V5.1L7.8 8.6H5.6A1.6 1.6 0 0 0 4 10.2z" />
      <path d="M16.9 9.4a3.8 3.8 0 0 1 0 5.2" />
      <path d="M19.4 6.9a7.4 7.4 0 0 1 0 10.2" />
    </Mark>
  );
}

/** Nhánh mã nguồn — phải tự dựng mới, không dùng lại repo. */
export function MarkBranch(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="6.8" cy="5.8" r="2.1" />
      <circle cx="17.2" cy="5.8" r="2.1" />
      <circle cx="12" cy="18.2" r="2.1" />
      <path d="M6.8 7.9v1.8a2.6 2.6 0 0 0 2.6 2.6h5.2a2.6 2.6 0 0 0 2.6-2.6V7.9" />
      <path d="M12 12.3v3.8" />
    </Mark>
  );
}

/** Cúp — giải thưởng. */
export function MarkTrophy(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M7.8 4h8.4v4.8a4.2 4.2 0 0 1-8.4 0z" />
      <path d="M7.8 5.6H6a2.4 2.4 0 0 0 0 4.8h.6" />
      <path d="M16.2 5.6H18a2.4 2.4 0 0 1 0 4.8h-.6" />
      <path d="M12 13v3.4" />
      <path d="M9.4 20h5.2l-.6-3.6H10z" />
    </Mark>
  );
}

/** Dấu tick trong vòng — tiêu chí ngưỡng sàn đã đạt. */
export function MarkCheck(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.4 12.3l2.5 2.5 4.7-5.2" />
    </Mark>
  );
}

/**
 * Nền trang trí cho các dải TỐI — hai quầng sáng cam đặt lệch nhau, phủ lưới chấm mờ.
 *
 * Vẽ bằng SVG + gradient của chính token màu, KHÔNG dùng ảnh: quầng sáng là thứ phải co giãn theo
 * bề ngang màn hình và đổi theo theme, một tấm PNG thì đóng cứng cả hai.
 */
export function DarkBandArt({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <radialGradient id="lg-glow-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-orange)" stopOpacity="0.38" />
            <stop offset="100%" stopColor="var(--color-orange)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="lg-glow-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-magenta)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-magenta)" stopOpacity="0" />
          </radialGradient>
          <pattern id="lg-dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" fill="var(--color-cream)" fillOpacity="0.06" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lg-dots)" />
        <ellipse cx="18%" cy="6%" rx="42%" ry="52%" fill="url(#lg-glow-a)" />
        <ellipse cx="88%" cy="88%" rx="38%" ry="46%" fill="url(#lg-glow-b)" />
      </svg>
    </div>
  );
}

/** Vạch phân cách mảnh, đậm dần ở giữa — dùng giữa hai dải cùng tông. */
export function HairlineDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full bg-gradient-to-r from-transparent via-cream/20 to-transparent"
    />
  );
}

/** Mũi tên phải — nút chính trên trang giới thiệu (trong app vẫn dùng Phosphor). */
export function MarkArrowRight(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M4.5 12h15" />
      <path d="M13.5 6l6 6-6 6" />
    </Mark>
  );
}

/** Mũi tên xuống — nút đóng/mở câu hỏi thường gặp. */
export function MarkChevronDown(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M5.5 9l6.5 6.5L18.5 9" />
    </Mark>
  );
}
