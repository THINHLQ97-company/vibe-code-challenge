import { departmentToBoard } from "./db/schema";

/**
 * Danh sách phòng ban cho ô chọn, dựng TỪ `departmentToBoard` chứ không gõ lại.
 *
 * Gõ lại là cách chắc chắn nhất để sinh ra đúng loại lệch đã gặp với mã Kinh doanh: thêm phòng ban
 * ở một chỗ, quên chỗ kia, rồi người dùng chọn được một mã mà bảng quy đổi không biết nên bảng thi
 * ra rỗng.
 */
const NAMES: Record<string, string> = {
  TS: "Hỗ trợ Kỹ thuật",
  DE: "Lập trình / Dev",
  OP: "Vận hành",
  MK: "Marketing",
  FI: "Tài chính / Kế toán",
  HR: "Nhân sự",
  BZ: "Kinh doanh",
};

export const DEPARTMENT_OPTIONS = Object.keys(departmentToBoard).map((code) => ({
  value: code,
  label: `${code} — ${NAMES[code] ?? code}`,
}));
