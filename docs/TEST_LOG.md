# Test Log — matbao-vibe-challenge (iMVP)

Test thủ công qua curl + kiểm tra render HTML thật (không phải chỉ gọi API), chạy trên
`docker compose` local với Postgres thật. Ngày: 2026-09-09.

## Auth
- [x] Signup email `@matbao.com` hợp lệ → tạo user, set cookie.
- [x] Signup email khác domain → 400 "Chỉ chấp nhận email @matbao.com".
- [x] Signup email trùng → 409.
- [x] Login đúng mật khẩu → set cookie, trả đúng role.
- [x] Login sai mật khẩu → 401.
- [x] `/api/auth/me` trả đúng user theo cookie, `null` khi chưa đăng nhập.
- [x] Middleware: chưa đăng nhập vào `/dashboard` hoặc `/admin` → redirect `/login?next=...`.
- [x] Middleware: role `candidate` vào `/admin` → redirect `/dashboard`.
- [x] Logout xoá cookie.

## Luồng CP1 → CP7 (đầy đủ 1 vòng, submission id=2 trong lần test)
1. [x] Candidate đăng ký đề tài (`POST /api/submissions`) → status `pending`.
2. [x] Admin duyệt (`POST /api/admin/submissions/:id/approve`) → status `approved`,
   `submissionDeadline` = `approvedAt + requestedDeadlineDays`.
3. [x] Trần duyệt/tuần: `countApprovedThisWeek` tính đúng theo tuần dương lịch (Thứ 2–CN).
4. [x] Admin nhập điểm ý tưởng thủ công (`manual-score` phase 1, source=`judge`) — dùng
   khi CHƯA có hệ chấm điểm ngoài kết nối thật.
5. [x] Candidate nộp Phase 2 (`vibehostUrl` + `githubRepoUrl`) → gọi GitHub API verify.
   Test với `GITHUB_BOT_PAT` chưa cấu hình thật → verify fail **graceful** (401 từ GitHub,
   không crash, trả `githubVerified:false` + lý do). Verify thành công cần PAT thật (action
   item trước launch — chưa test được path thành công qua GitHub API thật).
6. [x] Admin nhập điểm sản phẩm thủ công (kỹ thuật/hoàn thiện).
7. [x] Admin feedback `status=approved` → `kpi3pFlag=true`, `currentPhase` chuyển 2→3.
8. [x] Candidate nộp link Facebook (Phase 3).
9. [x] Admin duyệt bài (`approve-post`) → `facebookApprovedAt` set.
10. [x] Admin nhập engagement count → tự tính `engagementTier` (test case: count=80,
    cohort rỗng → tier=4 theo rule "trung vị=0 và count>0 → tier 4").
11. [x] Admin set `securityStatus=clean`.
12. [x] Admin publish → tính đúng `finalScore` (verify tay: 34 KT + 12 HT + 20 Ý tưởng
    (capped 25) + 20 lan tỏa (tier4) = **86** — khớp response API).
13. [x] Candidate nộp phiếu trải nghiệm (6 câu chung + 4 câu riêng theo bảng).
14. [x] Candidate gửi phản biện kèm bằng chứng.
15. [x] Admin resolve phản biện (`accepted`/`rejected` + ghi chú).

## Trường hợp đặc biệt
- [x] Candidate bị `returned` (trả về) đăng ký lại → tạo submission MỚI thành công (không
  chặn bởi check "đã có đề tài đang xử lý" vì status cũ là `returned`).
- [x] `isPrebuiltRepo=true` (seed candidate SALES) → trần kỹ thuật 20đ dù nhập điểm gốc
  cao hơn — verify: `computeFinalScore` áp đúng `Math.min(technicalRaw, 20)`.
- [x] Chưa công bố (`publishedAt=null`) → `/dashboard/results` hiện "đang chờ", KHÔNG lộ
  điểm — đúng business rule bắt buộc trong PRD.

## Render trang (không chỉ API — HTML thật)
Đã curl trực tiếp và grep nội dung, xác nhận KHÔNG phải trang lỗi/blank:
`/`, `/login`, `/signup`, `/dashboard`, `/dashboard/register`, `/dashboard/build`,
`/dashboard/share`, `/dashboard/survey`, `/dashboard/results`, `/dashboard/leaderboard`,
`/admin`, `/admin/topics`, `/admin/scoring`, `/admin/security`, `/admin/posts`,
`/admin/appeals` — tất cả 200, có nội dung thật (tên sản phẩm, điểm số, danh sách chờ
duyệt...) khớp dữ liệu seed.

## Chưa test được (cần điều kiện thật)
- GitHub verify với PAT thật + repo thật (chỉ test được nhánh lỗi do chưa có credential).
- Payload thật từ hệ chấm điểm ngoài (endpoint `/api/integrations/scores` mới test bằng
  payload tự giả định — CHƯA đối chiếu với đội build bộ chấm điểm).
- Tải thật ~30-40 đăng ký/tuần đồng thời (chỉ test tuần tự, chưa test concurrency).
- Next.js `output: standalone` qua `node .next/standalone/server.js` (mới test qua
  `next start` để iterate nhanh + qua `docker compose up` cho bản build cuối).
