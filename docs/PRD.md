# PRD: Matbao Vibe Code Challenge

**Owner**: Lâm Quang Thịnh (thinhlq@matbao.com)
**Team**: mk
**Status**: Approved
**Created**: 2026-09-09
**Nguồn tham chiếu**: `The-le-Cuoc-thi-Vibe-Coding-Noi-bo-v3.html` (thể lệ chính thức — nguồn chân lý cho barem/mốc/luật), `Bo-Giao-dien-Cuoc-thi-Vibe-Coding (1).html` (tham khảo bố cục UI), `dsvh.zip` (design system Vibe Host — copy trực tiếp component/token vì cùng stack Next.js)

## 1. Problem Statement
Mắt Bão tổ chức cuộc thi vibe coding nội bộ toàn công ty, 4 tháng, ~200–250 bài, để nhân sự tự tay làm sản phẩm & deploy Vibe Host, hiểu sản phẩm từ bên trong để tư vấn/bán/hỗ trợ khách tốt hơn. Vận hành thủ công qua Excel/Form rời rạc không kham nổi quy mô này (30–40 bài/tuần, chấm cuốn chiếu, nhiều mốc bắt buộc CP1–CP7, cơ chế phản biện có SLA 48h) — cần một nền tảng quản lý trọn luồng.

## 2. Target Users
- **Thí sinh**: toàn bộ nhân sự, 2 bảng — Kỹ thuật (TS, DE) và Văn phòng (OP, MK, FI, HR, Kinh Doanh).
- **BTC (admin)**: duyệt đề tài cuốn chiếu, theo dõi tiến độ, xác nhận & công bố kết quả, xử tranh chấp cuối.
- **BGK/Hội đồng**: duyệt case bị máy gắn cờ (ngưỡng sàn/bảo mật), duyệt bài Facebook, xử case phản biện mờ. (MVP gộp chung role `judge`/`admin`, tách vai chi tiết hơn ở Phase 2 nếu cần.)
- **Hệ chấm điểm AI ngoài**: không phải user UI — đẩy điểm vào qua API.

## 3. User Journeys (theo mốc CP1–CP7 + 3 phase chấm điểm)
1. **CP1** — Thí sinh xem landing công khai (giới thiệu + thể lệ) → Đăng nhập → đăng ký trong tuần.
2. **CP2** — Nộp form đăng ký đề tài (đủ 3 phần theo thể lệ mục Q) → BTC duyệt cuốn chiếu (trần 30–40/tuần) → chọn hạn nộp ≤15 ngày.
3. **Phase 1 · Điểm ý tưởng** — Ngay sau duyệt, hệ thống gửi nội dung form đăng ký cho hệ chấm điểm ngoài qua API → nhận điểm ý tưởng, hiển thị cho thí sinh. Không gate — ai cũng tiến tiếp.
4. **CP3** — Thí sinh tự đăng ký Vibe Host ở vibehost.matbao.ai (ngoài hệ thống), làm sản phẩm đạt đủ 6 tiêu chí ngưỡng sàn.
5. **Phase 2 · Điểm sản phẩm & mã nguồn** — Nộp link Vibe Host + link Git private, thêm machine-user GitHub (`matbao-vibe-bot`) làm collaborator → hệ thống tự verify qua GitHub API → hệ chấm ngoài chấm Chất lượng kỹ thuật + Hoàn thiện → BTC xem, ghi feedback cụ thể → thí sinh sửa & nộp lại → BTC xác nhận đạt → app đánh dấu trạng thái "đạt 90% Ứng dụng AI KPI 3P" (không đẩy đi đâu, hệ HRM tự đọc).
6. **CP4** — Qua cổng rà soát an toàn (7 điều cấm) — tự động là chính, người chỉ xử case bị gắn cờ.
7. **Phase 3 · Điểm lan tỏa** — Đăng bài ẩn danh lên Group "Vibe Coding chưa?" theo lịch/khung giờ → dán link (CP5) → BGK tick duyệt → đếm tương tác 7 ngày (nhập tay MVP) → hệ thống tự tính bậc điểm 1–4 theo % so với trung vị cùng khung giờ/tuần.
8. **CP6** — Nộp phiếu trải nghiệm sản phẩm (form nhập trực tiếp: 6 câu chung + 4 câu riêng theo bảng).
9. BTC xác nhận tổng điểm (Phase 1+2+3+gate) → công bố → Bảng xếp hạng theo bảng/tháng.
10. **CP7 (tuỳ chọn)** — Gửi phản biện ≤48h, 1 vòng, kèm bằng chứng; MVP: admin đọc & quyết định thủ công (không có AI sàng lọc tự động).

## 4. Functional Requirements
- **Auth**: email/password nội bộ (JWT tự viết trong Next.js API/route handlers), seed user test; schema có sẵn `oauth_provider`/`oauth_subject` để sau swap MS365 OAuth (không dùng NextAuth để dễ kiểm soát swap).
- **Landing công khai**: giới thiệu + thể lệ đầy đủ + nút "Đăng nhập" — không form đăng ký công khai.
- **User portal**: đăng ký đề tài (đủ field Phần 1–3 theo thể lệ) · theo dõi CP1–CP7 · xem điểm ý tưởng (Phase 1) · nộp Phase 2 (link Vibe Host + link Git + xác nhận add collaborator, app tự verify) · xem & phản hồi feedback BTC · nộp Phase 3 (link bài Facebook) · nộp phiếu trải nghiệm (form) · gửi phản biện (CP7) · xem kết quả (ẩn tới khi công bố) · bảng xếp hạng theo bảng.
- **Admin/BGK portal**: duyệt đề tài cuốn chiếu (kèm điểm ý tưởng Phase 1) · xem điểm Phase 2 từ hệ ngoài + ghi feedback + xác nhận đạt (set flag KPI 3P) · duyệt case gắn cờ · duyệt bài Facebook (tick) + nhập tay engagement count → hệ tự tính bậc điểm lan tỏa · xử phản biện thủ công · xác nhận & công bố kết quả · dashboard thống kê · quản lý thí sinh.
- **API nhận điểm từ hệ chấm ngoài**: 1 endpoint, phân biệt `phase` (1/2) trong payload, kèm `submission_id` + điểm từng module + tóm tắt + timestamp, auth bằng API key. (Payload/API key chi tiết — cần chốt cùng đội build bộ chấm điểm, đánh dấu integration point.)
- **GitHub verify (Phase 2)**: machine-user GitHub account (`matbao-vibe-bot`, do BTC/IT tạo & quản lý) + Personal Access Token lưu server-side secret. Thí sinh add account này làm collaborator (Read) vào repo private. Backend dùng PAT gọi GitHub API kiểm tra bot account truy cập được repo chưa (200 vs 404) → set `github_verified_at`. Action item trước launch: tạo tài khoản `matbao-vibe-bot` + sinh PAT.
- **UI**: copy trực tiếp component + token CSS từ `dsvh` (cùng stack Next.js+Tailwind+shadcn/ui) vào project — Button, Card, Table, Stepper, StatTile, Badge, Progress, FileUpload...; giữ `docs/design.md` ghi chú các component đã dùng & mapping với các trang trong app.

## 5. Non-functional Requirements
- Internal, ~200–500 user/mùa.
- Deploy Coolify, domain `matbao-vibe-challenge.mk.dev.matbao.ai`.
- Điểm ẩn với thí sinh tới khi BTC bấm công bố — bắt buộc.
- Con người chỉ can thiệp ở case ngoại lệ (gắn cờ, phản biện, tranh chấp).
- 3 role: candidate / judge / admin.

## 6. Data Model (high-level, Drizzle ORM + Postgres)
- **users**: id, name, email, password_hash, employee_code, department, board, role, oauth_provider, oauth_subject.
- **seasons**: id, name, start_date, end_date, cap_per_week.
- **submissions**: id, user_id, season_id, product_name, branch(A/B), topic_group, problem_desc, target_users, features(jsonb), database_plan, has_workflow, deploy_method, ai_tool, google_ai_pro(bool), risk_self_assessment, status, current_phase, submission_deadline, vibehost_url, github_repo_url, github_verified_at, facebook_post_url, facebook_approved_at, engagement_count, engagement_tier, published_at.
- **idea_scores** (Phase 1): submission_id, module_scores(jsonb), source, created_at.
- **product_scores** (Phase 2): submission_id, module_scores(jsonb), btc_feedback, feedback_status, source, created_at.
- **appeals**: submission_id, criteria, evidence_url, status, resolved_by, resolved_at.
- **experience_surveys**: submission_id, answers(jsonb theo board).

## 7. Integrations
- **Vibe Host**: tự đăng ký ngoài (vibehost.matbao.ai), không tích hợp API.
- **Hệ chấm điểm AI ngoài**: một chiều, đẩy điểm Phase 1 + Phase 2 qua API — cần chốt hợp đồng.
- **GitHub API**: verify collaborator Phase 2 qua machine-user + PAT — cần tạo account trước launch.
- **Facebook**: thủ công hoàn toàn — không Graph API trong MVP.
- **HRM/KPI 3P**: không tích hợp — hệ ngoài tự đọc từ DB/báo cáo của app này.

## 8. Out of Scope (iMVP)
Tự động cấp Vibe Host qua API · AI chấm điểm trong app này · tự động đọc Facebook Graph API · OAuth MS365 thật · verify Git trên GitLab (chỉ GitHub) · AI sàng lọc phản biện tự động · tự động đẩy dữ liệu sang hệ KPI 3P · đăng ký theo team nhiều người.

## 9. Success Criteria (iMVP)
- Luồng CP1→CP7 chạy được end-to-end trên UI, không qua Excel/Zalo thủ công.
- BTC/BGK có dashboard duyệt đề tài + theo dõi Phase 1/2/3 + công bố kết quả.
- Nhận & hiển thị đúng điểm từ API ngoài (demo qua curl/Postman) cho cả Phase 1 và Phase 2.
- Verify GitHub collaborator hoạt động đúng (demo với repo test).
- Deploy ổn định, pilot 10–20 người trước khi mở rộng ~200–250.

## 10. Phase Plan
- **Phase 1 (this PRD — iMVP)**: như trên, stack Next.js 15 + Drizzle ORM + PostgreSQL (template `next-fullstack-starter`), UI dùng trực tiếp design system `dsvh`.
- **Phase 2**: MS365 OAuth thật, verify GitLab, AI sàng lọc phản biện, tự động hoá Facebook Graph API, tự động đẩy KPI 3P nếu cần, đa mùa thi.
- **Phase 3**: mở rộng nền tảng dùng lại cho các cuộc thi/chương trình nội bộ khác.
