# docs/reference — tài liệu tham chiếu

## the-le-v3.html — BẢN CŨ, đừng tra luật ở đây

Cập nhật 15/09/2026.

`the-le-v3.html` là bản thể lệ soạn trước khi hệ thống này được dựng. Nó vẫn hữu ích để
tra phần **chưa đổi** (bảy điều cấm mục K, bậc điểm lan tỏa mục F, phiếu trải nghiệm mục S,
ngân hàng đề tài mục R), nhưng **đã lệch với luật đang chạy** ở những chỗ dưới đây.

Nguồn chân lý hiện tại: mã nguồn trong repo này + trang công bố
https://vibecodechallenge.matbao.ai/

| Nội dung             | Thể lệ v3 (cũ)                              | Luật đang chạy                                    |
|----------------------|---------------------------------------------|---------------------------------------------------|
| Repo/mẫu có sẵn      | Được phép, chấm trần 50% (tối đa 20/40 điểm) | CẤM — chặn ở Phase 2, xem `lib/scoring.ts`        |
| Phòng ban bảng Kỹ thuật | TS, DE                                   | TS, AI, DE, SA — lấy theo Odoo/Entra thật         |
| Số mốc               | CP1–CP7 (CP7 = phản biện)                   | CP1–CP6; phản biện là quyền, xem `lib/checkpoints.ts` |
| Đợt thi (wave)       | Không có khái niệm này                      | Có — đăng ký theo đợt, điểm thưởng đăng ký sớm    |
| Quyền lợi KPI        | "110% Năng lực AI"                          | Mục 5.2 Đề xuất cải tiến / sáng kiến, xem `lib/kpi.ts` |
| Thời lượng           | 4 tháng                                     | Chạy tới hết 2026                                 |
| Quy mô               | ~200–250 bài                                | ~190 nhân sự toàn công ty (HR xác nhận 15/09/2026)|

Chỗ nguy hiểm nhất là dòng đầu: thể lệ v3 nói dùng repo có sẵn **được phép** và chỉ bị
trừ điểm, luật hiện hành nói **cấm**. Ai tra nhầm sẽ tư vấn ngược cho thí sinh.
