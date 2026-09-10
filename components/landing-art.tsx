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

/* ── Chín nhóm chủ đề ────────────────────────────────────────────────────────────────────────
   Mỗi nhóm một hình riêng, vẫn lưới 24 / nét 1,75 để đứng chung hàng với bộ trên. Cố ý tránh
   trùng hình đã dùng ở chỗ khác (vd không lấy lại ổ dữ liệu cho nhóm Kỹ thuật) — hai nghĩa khác
   nhau mà cùng một hình thì người đọc phải dừng lại đoán.                                      */

/** Tài chính — tờ tiền chồng nhau. */
export function TopicFinance(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M3.2 7.6A1.8 1.8 0 0 1 5 5.8h11a1.8 1.8 0 0 1 1.8 1.8v6.2A1.8 1.8 0 0 1 16 15.6H5a1.8 1.8 0 0 1-1.8-1.8z" />
      <circle cx="10.5" cy="10.7" r="2.3" />
      <path d="M20.8 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H7.6" />
    </Mark>
  );
}

/** Kinh doanh / bán hàng — túi mua hàng. */
export function TopicSales(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M5.4 7.8h13.2l-1 11.4a1.8 1.8 0 0 1-1.8 1.6H8.2a1.8 1.8 0 0 1-1.8-1.6z" />
      <path d="M9 7.8V6a3 3 0 0 1 6 0v1.8" />
    </Mark>
  );
}

/** Marketing / Sales / CSKH — bia ngắm, nhắm đúng người dùng. */
export function TopicMarketing(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.1" />
    </Mark>
  );
}

/** Website / Kỹ thuật — cửa sổ trình duyệt có mã. */
export function TopicWeb(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="3" y="4.6" width="18" height="14.8" rx="2.2" />
      <path d="M3 9h18" />
      <path d="M9.6 12.6l-2 2 2 2M14.4 12.6l2 2-2 2" />
    </Mark>
  );
}

/** Quản lý / Vận hành — bảng cột việc. */
export function TopicOps(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.2" />
      <path d="M9.1 4.4v15.2M14.9 4.4v15.2" />
      <path d="M5.6 8.2h1.3M11.3 8.2h1.3M17.1 8.2h1.3" />
    </Mark>
  );
}

/** Văn phòng / Nhân sự — hai người. */
export function TopicPeople(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="9.2" cy="8.2" r="3.1" />
      <path d="M3.4 19.6c0-3.1 2.6-5.2 5.8-5.2s5.8 2.1 5.8 5.2" />
      <path d="M16.4 6.3a3.1 3.1 0 0 1 0 5.8" />
      <path d="M17.8 14.8c1.9.7 2.9 2.5 2.9 4.8" />
    </Mark>
  );
}

/** Pháp lý — cán cân. */
export function TopicLegal(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M12 6.4v13.2M7.4 19.6h9.2" />
      <path d="M4.4 8.6h15.2" />
      <circle cx="12" cy="5.1" r="1.3" />
      <path d="M4.4 8.6L2.2 13.6h4.4zM19.6 8.6l-2.2 5h4.4z" />
    </Mark>
  );
}

/** Giáo dục / học tập — mũ tốt nghiệp. */
export function TopicEdu(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M2.8 9.4L12 5.4l9.2 4-9.2 4z" />
      <path d="M6.6 11.4v4.4c0 1.6 2.4 2.6 5.4 2.6s5.4-1 5.4-2.6v-4.4" />
      <path d="M21.2 9.4v5.2" />
    </Mark>
  );
}

/** Cá nhân / đời sống — trái tim. */
export function TopicLife(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M12 19.6C9.6 18 4.7 14.6 4.7 10.6A4.2 4.2 0 0 1 12 7.9a4.2 4.2 0 0 1 7.3 2.7c0 4-4.9 7.4-7.3 9z" />
    </Mark>
  );
}

/* ── Sáu mốc bắt buộc ────────────────────────────────────────────────────────────────────── */

/** Bước 1 — điền và gửi form đăng ký. */
export function StepRegister(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M15.4 4.4H6.6a1.9 1.9 0 0 0-1.9 1.9v11.4a1.9 1.9 0 0 0 1.9 1.9h6.2" />
      <path d="M9 4.4V3.2h4.6v1.2" />
      <path d="M8.2 9.4h6M8.2 12.8h3.6" />
      <path d="M19.6 12.6l-4.9 4.9-2.4.6.6-2.4 4.9-4.9a1.2 1.2 0 0 1 1.8 1.8z" />
    </Mark>
  );
}

/** Bước 2 — đề tài kèm tài liệu được duyệt. */
export function StepApproved(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M13.6 3.6H6.4a1.9 1.9 0 0 0-1.9 1.9v13a1.9 1.9 0 0 0 1.9 1.9h11.2a1.9 1.9 0 0 0 1.9-1.9V9.5z" />
      <path d="M13.6 3.6v5.9h5.9" />
      <path d="M8.6 15.2l2.2 2.2 4.4-4.6" />
    </Mark>
  );
}

/** Bước 3 — đưa sản phẩm lên Vibe Host. */
export function StepDeploy(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M6.6 16.2c-2 0-3.6-1.6-3.6-3.6a3.6 3.6 0 0 1 3.1-3.5A5.2 5.2 0 0 1 16.3 8a4.1 4.1 0 0 1 .9 8.2z" />
      <path d="M12 19.8v-7" />
      <path d="M9.4 15l2.6-2.6 2.6 2.6" />
    </Mark>
  );
}

/** Bước 4 — qua cổng rà soát an toàn. */
export function StepSecurity(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M12 3.2l7.2 2.8v5.4c0 4.2-3 7.7-7.2 8.6-4.2-.9-7.2-4.4-7.2-8.6V6z" />
      <path d="M9.1 11.7l2 2 3.8-4" />
    </Mark>
  );
}

/** Bước 6 — nộp phiếu trải nghiệm. */
export function StepSurvey(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="4" y="3.6" width="16" height="16.8" rx="2" />
      <path d="M7.8 8.6l1.3 1.3 2.4-2.5" />
      <path d="M7.8 14.6l1.3 1.3 2.4-2.5" />
      <path d="M14.4 8.4h2.4M14.4 14.4h2.4" />
    </Mark>
  );
}

/* ── Hai bảng thi ────────────────────────────────────────────────────────────────────────── */

/** Bảng Kỹ thuật — dấu ngoặc mã nguồn. */
export function BoardTech(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M8.6 7.4L4 12l4.6 4.6M15.4 7.4L20 12l-4.6 4.6" />
      <path d="M13.4 4.8l-2.8 14.4" />
    </Mark>
  );
}

/** Bảng Văn phòng — cặp tài liệu. */
export function BoardOffice(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="3" y="7.2" width="18" height="12.4" rx="2" />
      <path d="M8.8 7.2V5.6a2 2 0 0 1 2-2h2.4a2 2 0 0 1 2 2v1.6" />
      <path d="M3 12.4h18" />
      <path d="M10.6 12.4h2.8v2.2h-2.8z" />
    </Mark>
  );
}

/* ── Phòng ban ───────────────────────────────────────────────────────────────────────────────
   Mỗi phòng một hình để thí sinh nhận ra phòng mình ngay, không phải đọc chữ viết tắt.       */

/** TS — Hỗ trợ Kỹ thuật. */
export function DeptSupport(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M4.4 14.4v-2.6a7.6 7.6 0 0 1 15.2 0v2.6" />
      <path d="M4.4 13.2h1.7a1.4 1.4 0 0 1 1.4 1.4v3a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4z" />
      <path d="M19.6 13.2h-1.7a1.4 1.4 0 0 0-1.4 1.4v3a1.4 1.4 0 0 0 1.4 1.4h.3a1.4 1.4 0 0 0 1.4-1.4z" />
      <path d="M19.6 18.2v.6a2 2 0 0 1-2 2h-3.2" />
    </Mark>
  );
}

/** DE — Lập trình / Dev. */
export function DeptDev(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="3" y="4.4" width="18" height="15.2" rx="2.2" />
      <path d="M3 8.6h18" />
      <path d="M8.4 12.4l-1.9 1.9 1.9 1.9M12.4 12.4l1.9 1.9-1.9 1.9" />
    </Mark>
  );
}

/** OP — Vận hành. */
export function DeptOps(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.8v2.6M12 18.6v2.6M4.5 12H2M22 12h-2.5M6.7 6.7L4.9 4.9M19.1 19.1l-1.8-1.8M17.3 6.7l1.8-1.8M4.9 19.1l1.8-1.8" />
    </Mark>
  );
}

/** MK — Marketing. */
export function DeptMarketing(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M20.4 5.6v10.2c0 1-1.1 1.6-2 1.1L13 13.8H6.6A2.6 2.6 0 0 1 4 11.2v-1a2.6 2.6 0 0 1 2.6-2.6H13l5.4-3.1c.9-.5 2 .1 2 1.1z" />
      <path d="M8.4 13.8v4.4a1.8 1.8 0 0 0 3.6 0v-4.4" />
    </Mark>
  );
}

/** FI — Tài chính / Kế toán. */
export function DeptFinance(p: MarkProps) {
  return (
    <Mark {...p}>
      <rect x="5" y="3" width="14" height="18" rx="2.2" />
      <rect x="8" y="6.2" width="8" height="3" rx="1" />
      <path d="M8.6 13h.01M12 13h.01M15.4 13h.01M8.6 17h.01M12 17h.01M15.4 17h.01" />
    </Mark>
  );
}

/** HR — Nhân sự. */
export function DeptHR(p: MarkProps) {
  return (
    <Mark {...p}>
      <circle cx="10.4" cy="8" r="3.4" />
      <path d="M3.8 19.6c0-3.3 3-5.6 6.6-5.6 1.3 0 2.5.3 3.5.8" />
      <path d="M14.6 17.6l1.7 1.7 3.6-3.8" />
    </Mark>
  );
}

/** Kinh doanh — Sales. */
export function DeptSales(p: MarkProps) {
  return (
    <Mark {...p}>
      <path d="M3.4 11.6l3-2.4a2 2 0 0 1 2.5 0l1.5 1.2a1.6 1.6 0 0 0 2.1-.1l2.6-2.4a2 2 0 0 1 2.7 0l2.3 2.1" />
      <path d="M10.4 13.6l1.9 1.9a1.5 1.5 0 0 0 2.2-2l-.4-.4" />
      <path d="M14.1 13.1l1.6 1.6a1.5 1.5 0 0 0 2.1-2.1l-1.6-1.6" />
      <path d="M3.4 11.6v4.2a2 2 0 0 0 2 2h1.3M20.6 10v5.8a2 2 0 0 1-2 2h-1" />
    </Mark>
  );
}

/**
 * Quầng sáng riêng cho dải GIẢI THƯỞNG — đậm hơn `DarkBandArt` và đặt đúng sau con số tổng.
 *
 * Toàn bộ dựng bằng gradient của token `orange`/`amber`, không thêm ảnh: quầng phải co giãn theo
 * bề ngang màn hình, và độ sáng phải đổi theo theme nếu sau này bật chế độ sáng.
 */
export function PrizeGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <radialGradient id="pz-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-orange)" stopOpacity="0.16" />
            <stop offset="60%" stopColor="var(--color-orange)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--color-orange)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* MỘT quầng rất rộng và rất nhạt, tâm đặt sau con số tổng. Bản trước dùng ba quầng ở
            42%/20% cùng lúc: ba vệt màu chồng nhau đọc ra như lỗi hiển thị chứ không như ánh
            sáng. Ánh sáng thật thì rộng, mờ, và chỉ có một nguồn. */}
        <ellipse cx="50%" cy="26%" rx="62%" ry="52%" fill="url(#pz-core)" />
      </svg>
      {/* Hai vạch mảnh phân tách dải, nhạt hơn trước để không thành khung viền. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange/28 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cream/12 to-transparent" />
    </div>
  );
}
