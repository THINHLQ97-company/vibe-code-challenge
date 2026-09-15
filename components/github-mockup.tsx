/**
 * Minh hoạ giao diện GitHub — vẽ tay bằng SVG, KHÔNG chụp màn hình.
 *
 * Ba lý do: ảnh chụp giao diện GitHub sẽ lạc hậu ngay khi họ đổi thiết kế; chụp màn hình tài khoản
 * thật là mang dữ liệu người thật vào tài liệu; và bản vẽ cho phép nhấn đúng bốn chỗ thí sinh cần
 * tìm, bỏ hết phần còn lại — thứ một ảnh chụp không làm được.
 *
 * Cố ý dừng ở mức NHẬN RA MẶT giao diện. Hướng dẫn chi tiết từng nút là thứ AI và công cụ tìm kiếm
 * làm tốt hơn, và cũng là bài tập đầu tiên của một cuộc thi vibe code.
 */
import { BTC_GITHUB_ACCOUNT } from "@/lib/btc-github";

export function GithubRepoMockup({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 300"
      className={`w-full ${className}`}
      role="img"
      aria-label="Minh hoạ giao diện kho mã nguồn trên GitHub: nút New, tên kho, nhãn Private và mục Settings"
    >
      <rect width="640" height="300" rx="10" fill="#0d1117" />
      <rect x="0" y="0" width="640" height="34" rx="10" fill="#161b22" />
      <rect x="0" y="24" width="640" height="10" fill="#161b22" />

      {/* Dấu GitHub */}
      <circle cx="24" cy="17" r="9" fill="#e6edf3" />
      <circle cx="24" cy="17" r="6.2" fill="#161b22" />
      <rect x="22.6" y="17" width="2.8" height="7" rx="1.2" fill="#e6edf3" />

      {/* Ô tìm kiếm giả */}
      <rect x="44" y="8" width="150" height="18" rx="5" fill="#0d1117" stroke="#30363d" />
      <text x="54" y="21" fill="#6e7681" fontSize="9" fontFamily="system-ui">
        Tìm kho mã…
      </text>

      {/* Nút New — nơi tạo kho mới */}
      <rect x="552" y="7" width="60" height="20" rx="5" fill="#238636" />
      <text x="582" y="21" fill="#fff" fontSize="10" fontWeight="600" textAnchor="middle" fontFamily="system-ui">
        New
      </text>
      <path d="M582 34 v14" stroke="#f0883e" strokeWidth="1.6" strokeDasharray="3 3" />
      <text x="582" y="60" fill="#f0883e" fontSize="10" textAnchor="middle" fontFamily="system-ui">
        1. Tạo kho mới
      </text>

      {/* Tên kho + nhãn riêng tư */}
      <text x="24" y="86" fill="#58a6ff" fontSize="15" fontWeight="600" fontFamily="system-ui">
        ten-cua-ban / san-pham-du-thi
      </text>
      <rect x="252" y="72" width="52" height="18" rx="9" fill="none" stroke="#f0883e" />
      <text x="278" y="85" fill="#f0883e" fontSize="9.5" textAnchor="middle" fontFamily="system-ui">
        Private
      </text>
      <text x="316" y="85" fill="#f0883e" fontSize="10" fontFamily="system-ui">
        ← 2. Phải để riêng tư
      </text>

      {/* Thanh menu của kho */}
      <line x1="24" y1="104" x2="616" y2="104" stroke="#21262d" />
      {["Code", "Issues", "Pull requests", "Actions"].map((t, i) => (
        <text key={t} x={24 + i * 78} y="120" fill="#7d8590" fontSize="10" fontFamily="system-ui">
          {t}
        </text>
      ))}
      <text x="336" y="120" fill="#f0883e" fontSize="10" fontWeight="600" fontFamily="system-ui">
        Settings
      </text>
      <rect x="330" y="108" width="52" height="17" rx="4" fill="none" stroke="#f0883e" />
      <text x="396" y="120" fill="#f0883e" fontSize="10" fontFamily="system-ui">
        ← 3. Thêm {BTC_GITHUB_ACCOUNT} vào đây
      </text>
      <line x1="24" y1="128" x2="616" y2="128" stroke="#21262d" />

      {/* Danh sách tệp */}
      {[
        { n: "app", d: "thư mục mã nguồn" },
        { n: "lib", d: "hàm dùng chung" },
        { n: "README.md", d: "mô tả sản phẩm" },
        { n: "package.json", d: "khai báo thư viện" },
      ].map((f, i) => (
        <g key={f.n}>
          <rect x="24" y={142 + i * 26} width="592" height="24" rx="4" fill="#0d1117" stroke="#21262d" />
          <rect x="34" y={150 + i * 26} width="10" height="8" rx="1.5" fill="#7d8590" />
          <text x="52" y={158 + i * 26} fill="#e6edf3" fontSize="10" fontFamily="system-ui">
            {f.n}
          </text>
          <text x="180" y={158 + i * 26} fill="#6e7681" fontSize="9" fontFamily="system-ui">
            {f.d}
          </text>
        </g>
      ))}

      {/* Đường dẫn kho — thứ phải dán vào hệ thống thi */}
      <rect x="24" y="252" width="440" height="24" rx="5" fill="#161b22" stroke="#30363d" />
      <text x="36" y="268" fill="#7d8590" fontSize="9.5" fontFamily="ui-monospace, monospace">
        https://github.com/ten-cua-ban/san-pham-du-thi
      </text>
      <text x="476" y="268" fill="#f0883e" fontSize="10" fontFamily="system-ui">
        ← 4. Dán link này vào bài thi
      </text>
    </svg>
  );
}
