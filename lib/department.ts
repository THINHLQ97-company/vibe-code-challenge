import { departmentToBoard } from "./db/schema";

/**
 * Quy đổi phòng ban → mã dự thi.
 *
 * Nguồn đối chiếu là DANH SÁCH PHÒNG BAN THẬT TRÊN ODOO (đọc từ
 * `https://api-ai.matbao.com/api/Employee/departments`, 24 mục, chốt 14/09/2026). Odoo đồng bộ với
 * tenant Microsoft nên chuỗi `department` mà Graph trả về khớp với các tên dưới đây.
 *
 * Khớp CHÍNH XÁC trước, dò từ khoá sau. Khớp chính xác cho kết quả chắc chắn với 24 mục đã biết;
 * dò từ khoá là lưới an toàn cho phòng ban mới sinh ra sau này mà chưa kịp bổ sung vào bảng —
 * thiếu nó thì một phòng mới nghĩa là toàn bộ nhân sự phòng đó không xếp được bảng thi.
 *
 * Không khớp gì thì trả `null` và người dùng tự chọn một lần ở màn hồ sơ. Đoán bừa thì tệ hơn
 * nhiều: xếp nhầm bảng thi nghĩa là thí sinh bị so tài với nhóm sai suốt cả mùa, và không ai phát
 * hiện ra cho tới lúc trao giải.
 */

/** Tên Odoo → mã dự thi. Chi nhánh HCM/HN gộp chung: cuộc thi chấm chuyên môn, không chấm địa điểm. */
const EXACT: Record<string, string> = {
  // ── Bảng Kỹ thuật — bốn team tách riêng theo yêu cầu BTC ─────────────────────────────
  "technical support": "TS",
  "technical support - ai": "AI",
  developers: "DE",
  "system admin": "SA",

  // ── Bảng Văn phòng ───────────────────────────────────────────────────────────────────
  // Kinh doanh gồm cả Chăm sóc khách hàng và các nhóm Tư vấn — cùng khối kinh doanh.
  "bz - hcm (mbc+mbi)": "BZ",
  "bz - hn": "BZ",
  "customer service - hcm": "BZ",
  "customer service - hn": "BZ",
  "consultants - mbc - hcm": "BZ",
  "consultants - mbc - hn": "BZ",
  "consultants - mbi - hcm": "BZ",
  "consultants - mbi - hn": "BZ",

  // "Maketing - VUX" thiếu chữ 'r' trong chính dữ liệu Odoo — chép đúng nguyên trạng, sửa lại cho
  // "đúng chính tả" là không khớp được gì.
  "marketing - macom": "MK",
  "maketing - vux": "MK",

  "finance - hcm": "FI",
  "finance - hn": "FI",
  "human resources - hcm": "HR",
  "human resources - hn": "HR",
  "operation - hcm": "OP",
  "operation - hn": "OP",
};

/**
 * Phòng ban không thuộc nhóm chuyên môn nào → gom vào mã `KHAC`, thi ở Bảng Văn phòng.
 *
 * Họ dự thi bình thường; chỉ khác ở chỗ hiển thị gom chung thành "Khác" thay vì bày ra bốn tên
 * hành chính chẳng nói lên điều gì với người đọc. Khai riêng thay vì để lưới dò từ khoá xử lý, vì
 * "Administration" và "Company" là những chữ quá chung — dò từ khoá sẽ bắt nhầm hàng loạt.
 */
const OTHER = new Set(["administration", "bod - hcm", "company", "te"]);

/** Lưới an toàn cho phòng ban mới chưa có trong bảng khớp chính xác. */
const KEYWORDS: Array<{ code: string; patterns: string[] }> = [
  // "technical support - ai" chứa cả "technical support", nên nhánh AI phải đứng TRƯỚC.
  { code: "AI", patterns: ["technical support - ai", " ai", "tri tue nhan tao"] },
  { code: "TS", patterns: ["technical support", "ho tro ky thuat", "helpdesk"] },
  { code: "SA", patterns: ["system admin", "sysadmin", "quan tri he thong"] },
  { code: "DE", patterns: ["developer", "lap trinh", "engineering", "dev"] },
  { code: "BZ", patterns: ["bz", "consultant", "customer service", "kinh doanh", "sales", "cskh"] },
  { code: "MK", patterns: ["marketing", "maketing", "marcom", "macom", "truyen thong"] },
  { code: "FI", patterns: ["finance", "tai chinh", "ke toan", "accounting"] },
  { code: "HR", patterns: ["human resource", "nhan su", "tuyen dung"] },
  { code: "OP", patterns: ["operation", "van hanh", "ops"] },
];

/** Bỏ dấu tiếng Việt và hạ chữ thường, để "Kế toán" và "ke toan" cùng dò được một luật. */
function normalize(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Chuỗi phòng ban thô → mã dự thi, hoặc `null` nếu không đủ căn cứ để xếp. */
export function resolveDepartmentCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = normalize(raw);
  if (!text) return null;
  if (OTHER.has(text)) return "KHAC";

  const exact = EXACT[text];
  if (exact) return exact;

  /**
   * Entra ghi phòng ban theo dạng "<Chức năng> - <MÃ>" — ĐO ĐƯỢC trên dữ liệu thật ngày
   * 15/09/2026: hai tài khoản đăng nhập đầu tiên đều trả về "Marketing - MK", chuỗi KHÔNG có
   * trong danh sách Odoo (Odoo ghi "Marketing - Macom" và "Maketing - VUX").
   *
   * Nghĩa là hai hệ thống ghi tên phòng ban khác nhau thật, đúng như đã lường. Thay vì chép tay
   * từng chuỗi Entra — mà mình chưa nhìn thấy hết — lấy luôn quy luật: đoạn cuối sau dấu gạch mà
   * trùng một mã đã biết thì chính là mã phòng ban.
   *
   * An toàn với các chuỗi Odoo: "Marketing - Macom" → "macom" không phải mã; "Finance - HN" →
   * "hn" không phải mã; "Consultants - MBC - HCM" → "hcm" không phải mã. Còn "Technical Support
   * - AI" → "ai" ĐÚNG là mã, và cũng đúng ý nghĩa.
   */
  const tail = text.split("-").pop()?.trim().toUpperCase();
  if (tail && tail in departmentToBoard) return tail;

  // Một số hồ sơ ghi thẳng mã ("MK", "TS") thay vì tên phòng.
  const asCode = text.toUpperCase();
  if (asCode in departmentToBoard) return asCode;

  for (const rule of KEYWORDS) {
    if (rule.patterns.some((p) => text.includes(p))) return rule.code;
  }
  return null;
}

/** Mã phòng ban → bảng thi. Trả `null` khi chưa xếp được phòng ban. */
export function resolveBoard(code: string | null): "ky_thuat" | "van_phong" | null {
  if (!code) return null;
  return departmentToBoard[code] ?? null;
}
