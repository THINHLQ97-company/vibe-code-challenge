import { departmentToBoard } from "./db/schema";

/**
 * Quy đổi chuỗi phòng ban của Microsoft Graph về mã phòng ban của cuộc thi.
 *
 * Graph trả về ô `department` là CHỮ TỰ DO do bên nhân sự gõ vào hồ sơ nhân viên — "Phòng
 * Marketing", "Technical Support", "Kinh doanh 2", "P. Kế toán"… chứ không phải mã "MK"/"TS".
 * Nên không thể so bằng nhau, phải dò theo từ khoá.
 *
 * Không khớp thì trả `null` và người dùng tự chọn phòng ban một lần ở màn hoàn tất hồ sơ. Đoán
 * bừa thì tệ hơn nhiều: xếp nhầm bảng thi nghĩa là thí sinh bị so tài với nhóm sai suốt cả mùa,
 * và không ai phát hiện ra cho tới lúc trao giải.
 */

const RULES: Array<{ code: keyof typeof departmentToBoard | string; patterns: string[] }> = [
  // Xếp TRƯỚC các nhánh kỹ thuật khác: "ho tro ky thuat" chứa cả "ky thuat", nên nếu để sau thì
  // nhân sự hỗ trợ kỹ thuật sẽ rơi nhầm vào nhánh lập trình.
  { code: "TS", patterns: ["ho tro ky thuat", "technical support", "helpdesk", "support"] },
  { code: "DE", patterns: ["lap trinh", "phat trien phan mem", "developer", "development", "dev", "engineering", "ky thuat"] },
  { code: "OP", patterns: ["van hanh", "operation", "ops"] },
  { code: "MK", patterns: ["marketing", "marcom", "truyen thong"] },
  { code: "FI", patterns: ["tai chinh", "ke toan", "finance", "accounting"] },
  { code: "HR", patterns: ["nhan su", "human resource", "hr", "tuyen dung"] },
  { code: "BZ", patterns: ["kinh doanh", "business", "sales", "ban hang", "bz"] },
];

/** Bỏ dấu tiếng Việt và hạ chữ thường, để "Kế toán" và "ke toan" cùng dò được một luật. */
function normalize(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Chuỗi phòng ban thô → mã phòng ban, hoặc `null` nếu không đủ căn cứ để xếp. */
export function resolveDepartmentCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const text = normalize(raw);
  if (!text) return null;

  // Đã là mã sẵn (một số hồ sơ ghi thẳng "MK", "TS") thì nhận luôn.
  const asCode = text.toUpperCase();
  if (asCode in departmentToBoard) return asCode;

  for (const rule of RULES) {
    if (rule.patterns.some((p) => text.includes(p))) return rule.code as string;
  }
  return null;
}

/** Mã phòng ban → bảng thi. Trả `null` khi chưa xếp được phòng ban. */
export function resolveBoard(code: string | null): "ky_thuat" | "van_phong" | null {
  if (!code) return null;
  return departmentToBoard[code] ?? null;
}
