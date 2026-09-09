# Implementation Plan: Matbao Vibe Code Challenge

**Phase**: iMVP (Phase 1)
**Team**: mk
**Est. duration**: ~10 ngày code-tay (human) — quy đổi giờ-AI + deadline thực tính bằng skill `task-et` sau khi PLAN approve
**Template**: `next-fullstack-starter` (Next.js 15 + Drizzle ORM + PostgreSQL)

## Scope

**IN scope** (iMVP):
- Landing công khai (giới thiệu + thể lệ) + đăng nhập/đăng ký email+password
- Đăng ký đề tài (CP2) + duyệt cuốn chiếu (trần 30–40/tuần)
- Phase 1: điểm ý tưởng qua API từ hệ chấm ngoài
- Phase 2: nộp link Vibe Host + Git private, verify GitHub collaborator (machine-user + PAT), nhận điểm sản phẩm qua API, vòng feedback BTC, flag KPI 3P
- CP4: cổng rà soát an toàn (trạng thái thủ công/từ hệ ngoài, admin xử case gắn cờ)
- Phase 3: đăng bài Facebook (thủ công), duyệt bài (CP5), nhập tay engagement, tự tính bậc điểm lan tỏa (1–4) theo trung vị
- CP6: phiếu trải nghiệm (form)
- CP7: phản biện thủ công (admin xử lý)
- Công bố kết quả (ẩn điểm tới khi publish) + bảng xếp hạng theo bảng/tháng
- Admin dashboard thống kê + quản lý thí sinh
- UI dùng trực tiếp design system `dsvh` (copy component + token)

**OUT of scope** (defer Phase 2+):
- MS365 OAuth thật
- Verify Git trên GitLab (chỉ GitHub)
- AI sàng lọc phản biện tự động
- Tự động hoá đếm tương tác Facebook (Graph API)
- Tự động đẩy dữ liệu sang hệ KPI 3P
- Đăng ký theo team nhiều người, đa mùa thi

## Implementation Steps

### Step 1: Scaffold + Design system (Day 1) — ✅ DONE
- [x] Clone template `next-fullstack-starter`, customize placeholders
- [x] Port token màu/chữ/bo góc từ `dsvh` vào `app/globals.css` + `tailwind.config.ts`
- [x] Copy component nền tảng (Button, Card, Input, Label, Badge) vào `components/ui/` — các component còn lại (Table, Stepper, StatTile, Progress, FileUpload, AuthCard...) port dần ở step cần tới
- [x] `docker compose up` chạy sạch (web + Postgres, `/api/health` trả `{"status":"ok","db":"ok"}`) — phải sửa thêm: pin `packageManager: pnpm@10.14.0` (tránh Corepack tải pnpm 12 khác host), thêm `public/` (Dockerfile cần, template thiếu), pin override `electron-to-chromium`/`ignore` qua pnpm supply-chain minimumReleaseAge check, đổi env NEXTAUTH_* → JWT_SECRET/SCORING_API_KEY/GITHUB_BOT_PAT
- [x] Viết `docs/design.md` — mapping token/component dsvh ↔ project này
- [x] Commit initial scaffold

### Step 2: Data model (Day 2) — ✅ DONE
- [x] Drizzle schema: `users, seasons, submissions, idea_scores, product_scores, appeals, experience_surveys` (+ enum role/board/branch/registration_status/feedback_status/appeal_status/score_source)
- [x] Migration (`drizzle/0000_marvelous_banshee.sql`) áp dụng vào Postgres local — verify `\dt` đủ 7 bảng
- [x] Seed dev (`pnpm db:seed`): 1 season, 4 user (admin/judge/candidate×2 board), 2 submission mẫu (1 đang Phase 2 có idea_score, 1 pending CP2)

### Step 3: Auth (Day 2–3) — ✅ DONE
- [x] Signup (email @matbao.com + password, zod validate) + login — JWT ký/verify bằng `jose` (không dùng `jsonwebtoken` vì middleware chạy Edge runtime không có Node crypto; tách `lib/auth/password.ts` Node-only khỏi `lib/auth/session.ts` Edge-safe để middleware bundle gọn)
- [x] Landing công khai (`app/page.tsx`, giới thiệu + nút Đăng nhập, không form đăng ký công khai) + trang `/login`, `/signup` dùng AuthCard + PasswordInput phỏng theo dsvh
- [x] Middleware bảo vệ `/dashboard` + `/admin`, redirect candidate ra khỏi `/admin`
- [x] Test thủ công qua curl: login/signup/logout, sai mật khẩu, email trùng, email sai domain, role-based redirect — tất cả đúng kỳ vọng
- [ ] Thể lệ đầy đủ trên landing — hiện chỉ có bản tóm tắt, nội dung thể lệ chi tiết (docs/reference/the-le-v3.html) sẽ đưa vào 1 trang riêng ở step polish (Step 10) hoặc khi BA yêu cầu

### Step 4: Đăng ký & duyệt đề tài — CP1/CP2 (Day 3–4) — ✅ DONE
- [x] API: `POST/GET /api/submissions` (candidate) · `GET /api/admin/submissions` +
  `approve`/`reject` (admin) — `lib/db/queries/submissions.ts`
- [x] Enforce trần duyệt/tuần (`season.capPerWeek`, mặc định 35) — tính theo tuần dương
  lịch Thứ 2–CN (giả định, xem Risks)
- [x] Frontend: `/dashboard/register` (form đủ 3 phần theo thể lệ mục Q) · `/admin/topics`
  (duyệt cuốn chiếu, trả về kèm lý do)

### Step 5: Phase 1 — điểm ý tưởng + API tích hợp ngoài (Day 4–5) — ✅ DONE
- [x] `POST /api/integrations/scores` nhận điểm từ hệ ngoài (phase=1|2, auth `X-API-Key`)
- [x] Fallback `POST /api/admin/submissions/:id/manual-score` cho BTC tự nhập khi chưa có
  hệ ngoài kết nối (đánh dấu `source="judge"` để phân biệt)
- [x] Hiển thị điểm ý tưởng ở `/dashboard` sau khi có

### Step 6: Phase 2 — sản phẩm, mã nguồn, GitHub verify (Day 5–6) — ✅ DONE
- [x] Form nộp link Vibe Host + link Git private (`/dashboard/build`)
- [x] GitHub verify qua `lib/github.ts` (machine-user `matbao-vibe-bot` + `GITHUB_BOT_PAT`)
  — test graceful fail khi chưa có PAT thật (xem docs/TEST_LOG.md)
- [x] Admin (`/admin/scoring`): xem điểm Phase 2 + ghi feedback + set `kpi3pFlag`
- [x] Thí sinh xem feedback, nộp lại không giới hạn lần (POST lại phase2 reset verify)

### Step 7: CP4 An toàn + Phase 3 Lan tỏa (Day 6–7) — ✅ DONE
- [x] Admin (`/admin/security`): set `clean`/`flagged` + ghi chú vi phạm điều nào
- [x] Thí sinh nộp link Facebook (`/dashboard/share`)
- [x] Admin (`/admin/posts`): tick duyệt bài + nhập tay engagement count sau 7 ngày
- [x] `lib/scoring.ts#engagementTierFromCount` tự tính bậc 1–4 theo trung vị cùng tuần

### Step 8: CP6 Phiếu trải nghiệm + CP7 Phản biện (Day 7–8) — ✅ DONE
- [x] Form phiếu trải nghiệm (`/dashboard/survey`, 6 câu chung + 4 câu theo bảng)
- [x] Thí sinh gửi phản biện (`/dashboard/results`, tiêu chí + bằng chứng)
- [x] Admin xử phản biện thủ công (`/admin/appeals`, chấp nhận/từ chối + ghi chú)

### Step 9: Công bố & Bảng xếp hạng & Dashboard (Day 8–9) — ✅ DONE
- [x] `POST /api/admin/submissions/:id/publish` tính `finalScore`
  (`lib/scoring.ts#computeFinalScore`) → mở hiển thị điểm cho thí sinh
- [x] Bảng xếp hạng theo bảng (`/dashboard/leaderboard`)
- [x] Admin dashboard (`/admin`): StatTile tổng đăng ký/chờ duyệt/đang làm/đã công bố/cảnh
  báo bảo mật + phân bổ theo nhóm chủ đề (thanh ngang CSS, không thêm chart lib)

### Step 10: Polish + demo data + docs + handoff (Day 9–10) — ✅ DONE
- [x] Seed demo data thực tế: 5 submission (Phase 2 dở dang, chờ duyệt, đã công bố ×2 với
  điểm khác nhau để test BXH, bị trả về) — `pnpm db:seed`
- [x] ESLint config (`eslint.config.mjs`) — trước đó project scaffold chưa có, `next lint`
  giờ chạy sạch
- [x] `docs/ARCH.md`, `docs/API.md` cập nhật đầy đủ theo code thật
- [x] `docs/TEST_LOG.md` — test luồng CP1→CP7 thủ công qua curl + verify HTML render thật
- [ ] `/vibe handoff` — CHƯA chạy, để user quyết định thời điểm handoff sang BA/BLĐ

## Risks + Assumptions
- **Chưa có hợp đồng API chính thức với đội chấm điểm ngoài**: mock bằng script curl/Postman để demo Step 5–6; cần đối soát payload thật trước go-live.
- **Machine-user GitHub `matbao-vibe-bot` chưa tồn tại**: action item BTC/IT tạo account + PAT trước Step 6 — nếu chưa kịp, Step 6 tạm bỏ qua bước verify tự động (chỉ lưu link) và note lại.
- **dsvh có nhiều dependency (radix-ui, cmdk, sonner, phosphor-icons...)**: cần rà soát `package.json` khi copy component, tránh version conflict với `next-fullstack-starter`.
- **Cách tính "tuần" cho cap 30–40/tuần và trung vị lan tỏa** chưa có định nghĩa chính xác (tuần dương lịch? theo ngày duyệt?) — giả định tuần dương lịch (Thứ 2–CN), xác nhận lại với BTC vận hành khi demo.
- **Không có SMTP xác thực email thật trong MVP** — signup chỉ validate định dạng `@matbao.com`, không gửi email xác nhận.

## Definition of Done (iMVP)
- [x] Luồng CP1→CP7 demo được end-to-end trên UI (test qua curl + render HTML thật)
- [x] `docker compose up` chạy sạch
- [x] Seed data đủ thực tế cho demo (nhiều trạng thái/phase)
- [x] Không có secret (GitHub PAT, API key hệ chấm điểm) hardcode trong code — toàn bộ qua env
- [x] README + docs đủ cho handoff (PRD/PLAN/ARCH/API/design/TEST_LOG)

## Còn lại trước khi go-live thật (không phải thiếu sót — phụ thuộc bên ngoài)
- Hợp đồng API chính thức với đội build hệ chấm điểm AI (payload/auth hiện là đề xuất).
- Tạo tài khoản GitHub `matbao-vibe-bot` thật + PAT (chưa test được nhánh verify thành công).
- Xác nhận với BTC vận hành: định nghĩa "tuần" cho trần duyệt + tính trung vị lan tỏa.
- MS365 OAuth thật (Phase 2 roadmap, schema đã sẵn sàng swap).
