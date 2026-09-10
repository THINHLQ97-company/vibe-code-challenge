/**
 * Nhãn KPI — MỘT nguồn cho cả khu thí sinh lẫn khu BTC.
 *
 * Bài thi đạt được tính vào mục **5.2 Đề xuất cải tiến / sáng kiến**. Trước đây các màn ghi tay
 * mỗi nơi một kiểu ("90% Ứng dụng AI theo KPI 3P", "110% Năng lực AI"), nên khi HR chốt lại đúng
 * mục nào thì phải đi sửa sáu chỗ và chắc chắn sót. Đổi nhãn ở đây là đổi toàn hệ thống.
 *
 * Tên cột trong DB vẫn là `kpi3p_flag` — xem chú thích ở `lib/db/schema.ts`.
 */
export const KPI_CODE = "5.2";
export const KPI_NAME = "Đề xuất cải tiến / sáng kiến";

/** Dạng đầy đủ, dùng trong câu văn: "…được tính vào mục 5.2 Đề xuất cải tiến / sáng kiến". */
export const KPI_CATEGORY = `mục ${KPI_CODE} ${KPI_NAME}`;

/** Dạng ngắn cho ô thống kê và huy hiệu. */
export const KPI_SHORT = `KPI ${KPI_CODE}`;
