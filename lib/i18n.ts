/**
 * Chuỗi hiển thị của component DSVH.
 *
 * Component DSVH gốc gọi `useTranslation()` của `react-i18next`. App này chỉ chạy MỘT
 * ngôn ngữ (vi) nên không kéo cả framework i18n vào — thay bằng module này, giữ NGUYÊN
 * API `const { t } = useTranslation()` để code component DSVH không phải sửa.
 *
 * Vẫn giữ đúng tinh thần luật wording của factory: câu chữ nằm TẬP TRUNG một chỗ để BA
 * sửa, DEV không tự chế chuỗi rải rác trong component.
 */
const vi: Record<string, string> = {
  "ds.copy": "Sao chép",
  "ds.copied": "Đã chép",
  "ds.tag_remove": "Gỡ nhãn",
  "ds.close": "Đóng",
  "ds.loading": "Đang tải",
  "ds.search": "Tìm kiếm",
  "ds.selected": "đã chọn",
  "ds.clear_selection": "Bỏ chọn",
  "ds.empty_title": "Chưa có dữ liệu",
  "ds.empty_filtered": "Không có kết quả khớp bộ lọc",
  "ds.rows_per_page": "Số dòng mỗi trang",
  "ds.page": "Trang",
  "ds.of": "/",
  "ds.prev": "Trang trước",
  "ds.next": "Trang sau",
  "ds.sort_asc": "Sắp xếp tăng dần",
  "ds.sort_desc": "Sắp xếp giảm dần",
  "ds.select_all": "Chọn tất cả",
  "ds.select_row": "Chọn dòng",
  "ds.more": "Thêm",
  "ds.hint": "Giải thích",
};

type TOptions = { defaultValue?: string } & Record<string, unknown>;

export function useTranslation() {
  const t = (key: string, options?: TOptions | string): string => {
    const fallback = typeof options === "string" ? options : options?.defaultValue;
    return vi[key] ?? fallback ?? key;
  };
  return { t };
}
