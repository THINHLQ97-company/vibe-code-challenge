# PRD: Matbao Vibe Code Challenge

**Owner**: Lâm Quang Thịnh (thinhlq@matbao.com)
**Team**: mk
**Status**: Approved
**Created**: 2026-09-09
**Nguồn chân lý (cập nhật 15/09/2026)**: mã nguồn trong repo này + trang công bố https://vibecodechallenge.matbao.ai/. `docs/reference/the-le-v3.html` là **bản cũ, chỉ để tham khảo lịch sử** — đã lệch ở ít nhất 4 chỗ (repo có sẵn, phòng ban bảng Kỹ thuật, số mốc, cơ chế đợt thi); xem `docs/reference/README.md`. Tham chiếu khác, `Bo-Giao-dien-Cuoc-thi-Vibe-Coding (1).html` (tham khảo bố cục UI), `dsvh.zip` (design system Vibe Host — copy trực tiếp component/token vì cùng stack Next.js)

## 1. Problem Statement
Mắt Bão tổ chức cuộc thi vibe coding nội bộ toàn công ty, chạy tới hết 2026, ~190 nhân sự (toàn bộ công ty, tham gia là bắt buộc), để nhân sự tự tay làm sản phẩm & deploy Vibe Host, hiểu sản phẩm từ bên trong để tư vấn/bán/hỗ trợ khách tốt hơn. Vận hành thủ công qua Excel/Form rời rạc không kham nổi quy mô này (đăng ký theo đợt 30–40 suất, chấm cuốn chiếu, sáu mốc bắt buộc CP1–CP6, cơ chế phản biện có SLA 48h) — cần một nền tảng quản lý trọn luồng.

## 2. Target Users
- **Thí sinh**: toàn bộ nhân sự, 2 bảng — Kỹ thuật (TS, DE) và Văn phòng (OP, MK, FI, HR, Kinh Doanh).
- **BTC (admin)**: duyệt đề tài cuốn chiếu, theo dõi tiến độ, xác nhận & công bố kết quả, xử tranh chấp cuối.
- **BGK/Hội đồng**: duyệt case bị máy gắn cờ (ngưỡng sàn/bảo mật), duyệt bài Facebook, xử case phản biện mờ. (MVP gộp chung role `judge`/`admin`, tách vai chi tiết hơn ở Phase 2 nếu cần.)
- **Hệ chấm điểm AI ngoài**: không phải user UI — đẩy điểm vào qua API.

## 3. User Journeys (theo mốc CP1–CP6 + 3 phase chấm điểm)
1. **CP1** — Thí sinh xem landing công khai (giới thiệu + thể lệ) → Đăng nhập → đăng ký trong tuần.
2. **CP2** — Nộp form đăng ký đề tài (đủ 3 phần theo thể lệ mục Q) → BTC duyệt cuốn chiếu (trần 30–40/tuần) → chọn hạn nộp ≤15 ngày.
3. **Phase 1 · Điểm ý tưởng** — Ngay sau duyệt, thí sinh đã nộp kèm **PRD** (nội dung
   markdown/text, đầu vào chấm Phase 1 theo thể lệ "chấm điểm PRD và document"). Hệ chấm
   điểm ngoài ĐỌC bài + PRD qua `GET /api/integrations/submissions/:id` (API key), rồi đẩy
   điểm ý tưởng về qua `POST /api/integrations/scores` → hiển thị cho thí sinh sau khi hội
   đồng xác nhận (`lib/score-visibility.ts`). Không gate — ai cũng tiến tiếp.
4. **CP3** — Thí sinh tự đăng ký Vibe Host ở vibehost.matbao.ai (ngoài hệ thống), làm sản phẩm đạt đủ 6 tiêu chí ngưỡng sàn.
5. **Phase 2 · Điểm sản phẩm & mã nguồn** — Nộp link Vibe Host + link Git private, thêm `git@matbao.ai` làm collaborator để BGK mở được kho khi chấm → hệ chấm ngoài chấm Chất lượng kỹ thuật + Hoàn thiện → BTC xem, ghi feedback cụ thể → thí sinh sửa & nộp lại → BTC xác nhận đạt → app đánh dấu bài được tính vào **KPI mục 5.2 Đề xuất cải tiến / sáng kiến** (không đẩy đi đâu, hệ HRM tự đọc — nhãn duy nhất khai ở `lib/kpi.ts`).
6. **CP4** — Qua cổng rà soát an toàn (7 điều cấm) — tự động là chính, người chỉ xử case bị gắn cờ.
7. **Phase 3 · Điểm lan tỏa** — Đăng bài ẩn danh lên Group "Vibe Coding chưa?" theo lịch/khung giờ → dán link (CP5) → BGK tick duyệt → đếm tương tác 7 ngày (nhập tay MVP) → hệ thống tự tính bậc điểm 1–4 theo % so với trung vị cùng khung giờ/tuần.
8. **CP6** — Nộp phiếu trải nghiệm sản phẩm (form nhập trực tiếp: 6 câu chung + 4 câu riêng theo bảng).
9. BTC xác nhận tổng điểm (Phase 1+2+3+gate) → công bố → Bảng xếp hạng theo bảng/tháng.
10. **Phản biện (quyền, không phải mốc)** — Gửi ≤48h sau khi có điểm, 1 vòng, kèm bằng chứng; MVP: admin đọc & quyết định thủ công (không có AI sàng lọc tự động). Thể lệ cũ đánh số việc này là "CP7"; bản hiện hành chỉ có sáu mốc CP1–CP6 (xem `lib/checkpoints.ts`).

## 4. Functional Requirements
- **Auth**: **đăng nhập Microsoft (Entra ID) — đã chạy thật**, là đường đăng nhập chính của thí sinh (migration `0010_ms_login_and_settings`; biến môi trường `AZURE_AD_*`). Hồ sơ nhân sự (họ tên, email, phòng ban) lấy thẳng từ Entra nên thí sinh không phải tự khai; phòng ban quyết định bảng thi qua `departmentToBoard`. Đường email/password + JWT tự viết vẫn giữ cho tài khoản BTC/giám khảo và seed test.
- **Landing công khai**: giới thiệu + thể lệ đầy đủ + nút "Đăng nhập" — không form đăng ký công khai.
- **User portal**: đăng ký đề tài (đủ field Phần 1–3 theo thể lệ, kèm **nộp PRD** — nội dung markdown/text 200–200 000 ký tự, căn cứ chấm Phase 1) · theo dõi CP1–CP6 · xem điểm ý tưởng (Phase 1, chỉ sau khi hội đồng xác nhận) · nộp Phase 2 (link Vibe Host + link Git + xác nhận add collaborator, app tự verify) · xem & phản hồi feedback BTC · nộp Phase 3 (link bài Facebook) · nộp phiếu trải nghiệm (form) · gửi phản biện · xem kết quả (ẩn tới khi công bố) · bảng xếp hạng theo bảng.
- **Admin/BGK portal**: duyệt đề tài cuốn chiếu (kèm điểm ý tưởng Phase 1) · xem điểm Phase 2 từ hệ ngoài + ghi feedback + xác nhận đạt (set flag KPI 3P) · duyệt case gắn cờ · duyệt bài Facebook (tick) + nhập tay engagement count → hệ tự tính bậc điểm lan tỏa · xử phản biện thủ công · xác nhận & công bố kết quả · dashboard thống kê · quản lý thí sinh.
- **API cho hệ chấm ngoài**: hai chiều — `GET /api/integrations/submissions/:id` để hệ
  ngoài ĐỌC bài + PRD (không trả danh tính thí sinh), và `POST /api/integrations/scores`
  để đẩy điểm vào, phân biệt `phase` (1/2), kèm `submission_id` + điểm từng module + tóm
  tắt + timestamp. Cả hai auth bằng `X-API-Key` (so khớp `timingSafeEqual`). (Payload chi
  tiết — cần chốt cùng đội build bộ chấm điểm, đánh dấu integration point.)
- **Quyền đọc mã nguồn (Phase 2)**: thí sinh add `git@matbao.ai` làm collaborator (Read) vào repo private. **Việc tự động verify qua GitHub API đã BỎ ngày 15/09/2026**: nó đòi một PAT máy chủ luôn còn hạn, và mỗi lần token hỏng thì mọi thí sinh đều thấy "chưa xác minh" — một lỗi phía hệ thống hiện ra như lỗi của họ, ngay giữa hạn nộp. BGK tự kiểm khi chấm, đằng nào cũng phải mở kho ra đọc. Cột `github_verified_at` giữ nguyên tên nhưng nay ghi mốc THÍ SINH NỘP ĐỦ HAI LINK.
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
- **submissions**: id, user_id, season_id, product_name, branch(A/B), topic_group, problem_desc, target_users, features(jsonb), **prd_content, prd_file_name** (PRD — đầu vào chấm Phase 1), database_plan, has_workflow, deploy_method, ai_tool, google_ai_pro(bool), risk_self_assessment, status, current_phase, submission_deadline, vibehost_url, github_repo_url, github_verified_at, **btc_feedback, feedback_status, kpi3p_flag** (quyết định CHUNG của BTC về cả bài — không nằm trên phiếu chấm), facebook_post_url, facebook_approved_at, engagement_count, engagement_tier, final_score(real), published_at.
- **idea_scores** (Phase 1): submission_id, **judge_id** (null = hệ chấm ngoài, unique theo submission+judge), module_scores(jsonb), source, created_at.
- **product_scores** (Phase 2): submission_id, **judge_id** (idem), module_scores(jsonb), source, created_at. `btc_feedback`/`feedback_status` đã chuyển lên `submissions` (mỗi phiếu giám khảo không còn mang cờ KPI riêng).
- **appeals**: submission_id, criteria, evidence_url, status, resolved_by, resolved_at.
- **experience_surveys**: submission_id, answers(jsonb theo board).

## 7. Integrations
- **Vibe Host**: tự đăng ký ngoài (vibehost.matbao.ai), không tích hợp API.
- **Hệ chấm điểm AI ngoài**: hai chiều — đọc bài + PRD qua `GET /api/integrations/submissions/:id`, đẩy điểm Phase 1 + Phase 2 qua `POST /api/integrations/scores` — cần chốt hợp đồng payload chính thức.
- **GitHub API**: verify collaborator Phase 2 qua machine-user + PAT — cần tạo account trước launch.
- **Facebook**: thủ công hoàn toàn — không Graph API trong MVP.
- **HRM/KPI 3P**: không tích hợp — hệ ngoài tự đọc từ DB/báo cáo của app này.

## 8. Out of Scope (iMVP)
Tự động cấp Vibe Host qua API · AI chấm điểm trong app này · tự động đọc Facebook Graph API · verify Git trên GitLab (chỉ GitHub) · AI sàng lọc phản biện tự động · tự động đẩy dữ liệu sang hệ KPI 3P · đăng ký theo team nhiều người.

## 9. Success Criteria (iMVP)
- Luồng CP1→CP6 chạy được end-to-end trên UI, không qua Excel/Zalo thủ công.
- BTC/BGK có dashboard duyệt đề tài + theo dõi Phase 1/2/3 + công bố kết quả.
- Nhận & hiển thị đúng điểm từ API ngoài (demo qua curl/Postman) cho cả Phase 1 và Phase 2.
- Verify GitHub collaborator hoạt động đúng (demo với repo test).
- Deploy ổn định, pilot 10–20 người trước khi mở rộng ~200–250.

## 10. Phase Plan
- **Phase 1 (this PRD — iMVP)**: như trên, stack Next.js 15 + Drizzle ORM + PostgreSQL (template `next-fullstack-starter`), UI dùng trực tiếp design system `dsvh`.
- **Phase 2**: verify GitLab, AI sàng lọc phản biện, tự động hoá Facebook Graph API, tự động đẩy dữ liệu sang hệ KPI nếu cần, đa mùa thi. (MS365 OAuth đã làm xong ở Phase 1 — xem mục 4.)
- **Phase 3**: mở rộng nền tảng dùng lại cho các cuộc thi/chương trình nội bộ khác.
