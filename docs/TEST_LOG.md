# Test Log — matbao-vibe-challenge (iMVP)

Test thủ công qua curl + kiểm tra render HTML thật (không phải chỉ gọi API), chạy trên
`docker compose` local với Postgres thật. Ngày: 2026-09-09 → 2026-09-10.

**Repo CHƯA có test tự động** (không Vitest/Playwright chạy thật dù `CLAUDE.md` đặt mục
tiêu coverage >70%) — mọi mục dưới đây là kiểm THỦ CÔNG qua curl/render HTML, lặp lại thủ
công mỗi lần sửa luồng. Ghi lại đây để lần sau còn biết kịch bản nào đã chạy qua.

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

## Chấm nhiều giám khảo — trung bình (2026-09-09)
- [x] 2 giám khảo cùng chấm 1 bài (idea + product), mỗi người 1 phiếu (`judgeId` từ
  session). Verify E2E: `(36+33)/2` giá trị ứng dụng + `(14+13)/2` hoàn thiện +
  `(22+24)/2` kỹ thuật + 20 lan tỏa → `finalScore = 91`, khớp response API publish.
- [x] Giám khảo gọi lại `manual-score` cho cùng bài/phase → SỬA phiếu cũ của chính họ
  (không đẻ thêm phiếu) — verify bảng `idea_scores`/`product_scores` không phát sinh
  dòng mới, chỉ `updatedAt`/nội dung đổi.
- [x] `getAggregatedScores`: có phiếu giám khảo thì lấy trung bình; chưa ai chấm tay thì
  rơi về điểm hệ chấm ngoài (`source="judge"` vs `"external_ai"`).

## Các cổng chặn CP bị hở trước đây, nay đã siết (2026-09-09 → 2026-09-10)
- [x] `publish` chặn khi thiếu bất kỳ mốc nào trong CP1–CP6 (trước chỉ kiểm CP4+CP5) —
  test case thiếu CP6 (chưa nộp phiếu trải nghiệm) → 409 kèm danh sách `missing`.
- [x] `publish` chặn công bố lại bài đã có `publishedAt` → 409 "Bài này đã công bố kết quả".
- [x] `engagement` chặn nhập số tương tác khi `facebookApprovedAt` chưa set (CP5) → 409.
- [x] `phase3` chặn nộp link lan tỏa khi chưa có `vibehostUrl` (Phase 2) → 409; chặn đổi
  link sau khi BGK đã duyệt bài (`facebookApprovedAt` đã set) → 409.
- [x] `appeals` chặn: chưa công bố → 409; quá 48h kể từ `publishedAt` → 409; gửi lần hai
  cho cùng bài → 409 "Mỗi bài chỉ được phản biện một lần".

## Xác thực PRD (2026-09-09)
- [x] `POST /api/submissions` thiếu `prdContent` → 400 yêu cầu đính PRD.
- [x] `prdContent` dưới 200 ký tự → 400 "Tài liệu PRD quá ngắn".
- [x] `prdContent` vượt 200 000 ký tự → 400 "Tài liệu quá dài".
- [x] `GET /api/integrations/submissions/:id` (X-API-Key hợp lệ) trả đúng `prd`/`prdFileName`,
  KHÔNG có tên/email thí sinh trong response.
- [x] `GET /api/integrations/submissions/:id` với API key sai → 401 (so khớp bằng
  `timingSafeEqual`, không phải `!==`).

## Vòng phản biện: chấp nhận → mở lại → chấm lại → công bố lại (2026-09-10)
- [x] Chạy trọn vòng trên 1 bài: công bố lần 1 (`finalScore=84`) → thí sinh gửi phản biện
  → BTC `accepted` → `reopenForRescore()` xoá `publishedAt`/`finalScore` → hội đồng chấm
  lại → công bố lần 2 (`finalScore=91`) → thí sinh đọc được kết luận phản biện lần 1 →
  gửi phản biện lần hai cho cùng bài → bị chặn (409, đúng luật "một lần duy nhất").

## Đồng bộ hai chiều BTC ↔ thí sinh (2026-09-10)
- [x] BTC gắn cờ CP4 (`securityStatus=flagged` + `securityNote`) → thí sinh thấy lý do ở
  cả `/dashboard` lẫn `/dashboard/build` (trước đây thí sinh không thấy gì).
- [x] Dashboard thí sinh chuyển sang `getAggregatedScores` (cùng nguồn dữ liệu với
  `/admin/scoring`) — chỉ hiện điểm khi có phiếu giám khảo, hiện "Đang đối chiếu" khi chỉ
  có điểm máy — khớp `lib/score-visibility.ts`.
- [x] Form dán link bài đăng (`/dashboard/share`) khoá ô nhập kèm lý do sau khi BGK đã
  duyệt bài — khớp 409 phía API `phase3`.
- [x] `getNextAction` (việc-tiếp-theo của thí sinh) phản ánh đúng: bài bị gắn cờ an toàn,
  BTC yêu cầu sửa (`needs_fix`), và thứ tự "chờ BGK duyệt bài" đặt TRƯỚC phiếu trải
  nghiệm (trước đây bị đảo ngược).

## Phân quyền (2026-09-10)
- [x] Thí sinh (`role=candidate`) vào bất kỳ route `/admin/*` → redirect 307 về `/dashboard`.
- [x] Thí sinh gọi thẳng API chỉ dành cho BTC/BGK (vd `manual-score`, `publish`) → 403.
- [x] Thí sinh sửa/xem bài dự thi của người khác (`phase2`, `phase3`, `appeals`) → 404
  (không lộ cả sự tồn tại của bài).

## Đăng ký tài khoản — validate (2026-09-10)
- [x] Email ngoài domain `@matbao.com` → 400.
- [x] Mật khẩu dưới 8 ký tự → 400.
- [x] Phòng ban không nằm trong danh sách hợp lệ → 400 "Chọn phòng ban hợp lệ".
- [x] Email đã tồn tại → 409.
- [x] Phòng ban `TS` tự xếp bảng `ky_thuat` (Kỹ thuật) theo `departmentToBoard`.

## Trường hợp đặc biệt
- [x] Candidate bị `returned` (trả về) đăng ký lại → tạo submission MỚI thành công (không
  chặn bởi check "đã có đề tài đang xử lý" vì status cũ là `returned`).
- [~] ~~`isPrebuiltRepo=true` → trần kỹ thuật 20đ~~ — **case này đã lỗi thời**. Luật đổi:
  dùng repo/mẫu có sẵn nay là VI PHẠM, chặn thẳng ở Phase 2 (`lib/publish-one.ts` trả
  "Bị gắn cờ dùng repo/mẫu có sẵn"), không còn là lựa chọn hợp lệ bị trừ điểm. Cần viết
  lại case: `isPrebuiltRepo=true` → `publishOne` từ chối công bố.
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
  payload tự giả định — CHƯA đối chiếu với đội build bộ chấm điểm). Tương tự,
  `GET /api/integrations/submissions/:id` mới test bằng client tự viết (curl), CHƯA có
  bộ chấm điểm thật gọi vào để xác nhận format `prd`/`prdFileName` đủ dùng.
- Tải thật ~30-40 đăng ký/tuần đồng thời (chỉ test tuần tự, chưa test concurrency).
- Next.js `output: standalone` qua `node .next/standalone/server.js` (mới test qua
  `next start` để iterate nhanh + qua `docker compose up` cho bản build cuối).
