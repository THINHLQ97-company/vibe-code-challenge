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

### Step 3: Auth (Day 2–3)
- [ ] Signup (email @matbao.com + password) + login, JWT tự viết trong route handlers (không NextAuth)
- [ ] Landing công khai (giới thiệu + thể lệ) + trang login/signup dùng AuthCard của dsvh
- [ ] Middleware phân quyền theo role (candidate/judge/admin)

### Step 4: Đăng ký & duyệt đề tài — CP1/CP2 (Day 3–4)
- [ ] API: tạo/xem submission của tôi; admin list + approve/reject cuốn chiếu
- [ ] Enforce cap 30–40 submission được duyệt/tuần
- [ ] Frontend: form đăng ký đủ 3 phần (thể lệ mục Q) · trang admin duyệt đề tài

### Step 5: Phase 1 — điểm ý tưởng + API tích hợp ngoài (Day 4–5)
- [ ] `POST /api/integrations/scores` nhận điểm từ hệ ngoài (phase=1|2, auth API key)
- [ ] Hiển thị điểm ý tưởng cho thí sinh sau khi có

### Step 6: Phase 2 — sản phẩm, mã nguồn, GitHub verify (Day 5–6)
- [ ] Form nộp link Vibe Host + link Git private
- [ ] GitHub verify: gọi API bằng PAT của `matbao-vibe-bot`, set `github_verified_at`
- [ ] Admin: xem điểm Phase 2 (từ hệ ngoài) + ghi feedback + đánh dấu "đã sửa xong" (set flag KPI 3P)
- [ ] Thí sinh: xem feedback, sửa & nộp lại không giới hạn lần trong hạn

### Step 7: CP4 An toàn + Phase 3 Lan tỏa (Day 6–7)
- [ ] Admin: xử case rà soát bị gắn cờ (thủ công/nhận từ hệ ngoài)
- [ ] Thí sinh: nộp link bài Facebook ẩn danh (CP5)
- [ ] Admin: tick duyệt bài + nhập tay engagement count sau 7 ngày
- [ ] Backend: tự tính trung vị cùng khung giờ/tuần → bậc điểm 1–4 → điểm lan tỏa

### Step 8: CP6 Phiếu trải nghiệm + CP7 Phản biện (Day 7–8)
- [ ] Form phiếu trải nghiệm (6 câu chung + 4 câu theo bảng)
- [ ] Thí sinh gửi phản biện (tiêu chí + bằng chứng, trong 48h từ khi có điểm)
- [ ] Admin xử phản biện thủ công (chấp nhận/từ chối + ghi lý do)

### Step 9: Công bố & Bảng xếp hạng & Dashboard (Day 8–9)
- [ ] Admin: xác nhận tổng điểm (Phase1+2+3) → nút công bố (publish) → mở hiển thị điểm cho thí sinh
- [ ] Bảng xếp hạng theo bảng (Kỹ thuật/Văn phòng) + theo tháng
- [ ] Admin dashboard: tổng đăng ký/chờ duyệt/đã nộp/đã đậu, biểu đồ theo tuần, phân bổ nhóm chủ đề

### Step 10: Polish + demo data + docs + handoff (Day 9–10)
- [ ] Seed demo data thực tế (nhiều submission ở nhiều trạng thái/phase khác nhau)
- [ ] Error handling, empty states, responsive mobile
- [ ] `docs/ARCH.md`, `docs/API.md` cập nhật
- [ ] `TEST_LOG.md` — test luồng CP1→CP7 thủ công
- [ ] `/vibe handoff` chuẩn bị

## Risks + Assumptions
- **Chưa có hợp đồng API chính thức với đội chấm điểm ngoài**: mock bằng script curl/Postman để demo Step 5–6; cần đối soát payload thật trước go-live.
- **Machine-user GitHub `matbao-vibe-bot` chưa tồn tại**: action item BTC/IT tạo account + PAT trước Step 6 — nếu chưa kịp, Step 6 tạm bỏ qua bước verify tự động (chỉ lưu link) và note lại.
- **dsvh có nhiều dependency (radix-ui, cmdk, sonner, phosphor-icons...)**: cần rà soát `package.json` khi copy component, tránh version conflict với `next-fullstack-starter`.
- **Cách tính "tuần" cho cap 30–40/tuần và trung vị lan tỏa** chưa có định nghĩa chính xác (tuần dương lịch? theo ngày duyệt?) — giả định tuần dương lịch (Thứ 2–CN), xác nhận lại với BTC vận hành khi demo.
- **Không có SMTP xác thực email thật trong MVP** — signup chỉ validate định dạng `@matbao.com`, không gửi email xác nhận.

## Definition of Done (iMVP)
- [ ] Luồng CP1→CP7 demo được end-to-end trên UI
- [ ] `docker compose up` chạy sạch
- [ ] Seed data đủ thực tế cho demo (nhiều trạng thái/phase)
- [ ] Không có secret (GitHub PAT, API key hệ chấm điểm) hardcode trong code — toàn bộ qua env
- [ ] README + docs đủ cho handoff
