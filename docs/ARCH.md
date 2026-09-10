# Architecture: matbao-vibe-challenge

## Stack
- **Frontend + API**: Next.js 15 App Router (TypeScript strict)
- **Database**: Postgres 16
- **ORM**: Drizzle
- **Auth**: JWT tự viết bằng `jose` (KHÔNG dùng NextAuth) — xem "Auth" bên dưới
- **UI**: Design system port từ Vibe Host (`dsvh`) — xem `docs/design.md`
- **Runtime**: Node 22

## Services

| Service | Port | Image | Responsibility |
|---------|------|-------|----------------|
| web | 3000 | node:22-alpine (built từ Dockerfile) | Next.js fullstack |
| db | 5432 | postgres:16-alpine | Primary database |

## Component Diagram

```mermaid
graph LR
  Candidate[Thí sinh] --> W[Next.js web :3000]
  Admin[BTC/BGK] --> W
  External[Hệ chấm điểm AI ngoài] -->|GET /api/integrations/submissions/:id| W
  External -->|POST /api/integrations/scores| W
  W --> MW[middleware.ts — JWT verify, role gate]
  MW --> API[App Router API routes]
  API --> Q[lib/db/queries/*]
  Q --> D[(Postgres :5432)]
  API -->|verify collaborator| GH[GitHub API]
```

## Auth
- Email/password nội bộ (domain `@matbao.com` bắt buộc khi signup), hash bằng `bcryptjs`.
- Session = JWT ký bằng `jose` (HS256, cookie httpOnly `vcc_token`, 7 ngày).
- **Tại sao `jose` chứ không phải `jsonwebtoken`**: `middleware.ts` chạy Edge runtime,
  không có Node `crypto` — `jsonwebtoken` sẽ crash. `jose` chạy được cả hai.
- Tách `lib/auth/password.ts` (bcrypt, Node-only) khỏi `lib/auth/session.ts` (jose,
  Edge-safe) để middleware không bundle nhầm code Node-only.
- Schema `users` có sẵn `oauthProvider`/`oauthSubject` (nullable) để Phase 2 swap sang
  MS365 OAuth thật mà không đổi schema.
- 3 role: `candidate` / `judge` / `admin`. Middleware chặn candidate vào `/admin/*`.

## Data Flow — luồng chính (3-phase chấm điểm)
1. Thí sinh đăng ký đề tài (`POST /api/submissions`) → BTC duyệt cuốn chiếu, có trần
   `capPerWeek`/tuần (`lib/db/queries/submissions.ts#countApprovedThisWeek`).
2. **Phase 1**: thí sinh nộp kèm PRD (`prdContent`/`prdFileName`, nội dung markdown/text —
   đầu vào bắt buộc để chấm "PRD và document" theo thể lệ). Hệ chấm điểm AI ngoài ĐỌC bài +
   PRD qua `GET /api/integrations/submissions/:id`, rồi đẩy điểm ý tưởng về qua
   `POST /api/integrations/scores` (cả hai auth bằng header `X-API-Key` = `SCORING_API_KEY`,
   so khớp `timingSafeEqual`). App CHỈ lưu, không tự chấm. Thí sinh chỉ thấy điểm sau khi có
   phiếu giám khảo xác nhận (`lib/score-visibility.ts`), không thấy điểm máy thô.
3. **Phase 2**: thí sinh nộp link Vibe Host + Git repo private
   (`POST /api/submissions/:id/phase2`) → app tự verify GitHub collaborator qua
   `lib/github.ts` (machine-user `matbao-vibe-bot` + `GITHUB_BOT_PAT`) → hệ chấm ngoài
   đẩy điểm kỹ thuật/hoàn thiện → BTC feedback (`needs_fix`/`approved`) → approved thì
   set `kpi3pFlag=true` (app chỉ đánh dấu, không đẩy đi đâu — hệ HRM tự đọc).
4. **CP4**: rà soát an toàn — admin set `securityStatus` (`clean`/`flagged`).
5. **Phase 3**: thí sinh đăng bài Facebook ẩn danh → BGK tick duyệt → admin nhập tay số
   tương tác sau 7 ngày → `lib/scoring.ts#engagementTierFromCount` tự tính bậc 1-4 theo
   trung vị cùng tuần (`getEngagementCohort`).
6. **Công bố**: `POST /api/admin/submissions/:id/publish` kiểm đủ **CP1–CP6** một lượt
   (`lib/checkpoints.ts#missingCheckpoints`, một nguồn sự thật dùng chung với dashboard thí
   sinh và `/admin/posts`), chặn công bố lại bài đã công bố, lấy điểm module từ
   `getAggregatedScores()` (`lib/db/queries/scores.ts` — **trung bình các phiếu giám khảo**,
   rơi về điểm hệ chấm ngoài khi chưa ai chấm tay) rồi tính `finalScore` bằng
   `lib/scoring.ts#computeFinalScore` (40 kỹ thuật + 15 hoàn thiện + 25 ý tưởng + 20 lan
   tỏa, trần kỹ thuật 20 nếu `isPrebuiltRepo`) → set `publishedAt` → hiện trên BXH
   (`listPublishedByBoard`).
7. **CP7 (tuỳ chọn)**: thí sinh gửi phản biện trong 48h kể từ công bố, một lần duy nhất
   (`lib/appeal-policy.ts`, dùng chung cho `/dashboard/results` và API). Admin xử thủ công
   (chưa có AI sàng lọc tự động — Phase 2 roadmap); chấp nhận thì `reopenForRescore()` xoá
   `publishedAt`/`finalScore` để hội đồng chấm lại rồi công bố lại — không chỉ ghi kết luận
   suông.

## Modules dùng chung (một nguồn sự thật)

Trước bản sửa gần nhất, mỗi màn tự liệt kê lại luật riêng (dashboard đòi 6 mốc, API
`publish` chỉ kiểm 2 mốc; trang kết quả biết luật phản biện 48h nhưng API `appeals` thì
không) — sửa một chỗ, quên chỗ khác. Nay gom vào các module thuần hàm dưới `lib/`:

| Module | Dùng ở đâu | Việc |
|---|---|---|
| `lib/checkpoints.ts` | `/dashboard`, `/dashboard/build`, `/admin/posts`, `POST .../publish` | `getCheckpoints`/`missingCheckpoints` — mốc CP1–CP6 bắt buộc để công bố |
| `lib/appeal-policy.ts` | `/dashboard/results`, `POST /api/submissions/:id/appeals` | `checkAppealGate` — cửa sổ 48h kể từ `publishedAt` + đúng một lần |
| `lib/score-visibility.ts` | `/dashboard`, `/dashboard/results` | `candidateScoreView` — chỉ hiện điểm khi có phiếu giám khảo (`judges`), điểm máy (`external_ai`) hiện "Đang đối chiếu" |
| `lib/db/queries/scores.ts#getAggregatedScores` | API `publish`, dashboard thí sinh | Điểm CHỐT một bài = trung bình các phiếu giám khảo, rơi về điểm hệ ngoài khi chưa ai chấm tay |
| `lib/db/queries/scores.ts#getScoreOverviews` | `/admin/scoring` | Tổng hợp điểm cho NHIỀU bài trong 2 truy vấn (trước đây N bài × 2 truy vấn/bài) |

## Folder Structure

```
app/
  page.tsx                     # Landing công khai (giới thiệu + nút Đăng nhập)
  login/, signup/               # Auth pages
  dashboard/                    # Khu vực thí sinh (bảo vệ bởi middleware)
    register/                   # Đăng ký đề tài (CP2)
    build/                      # Phase 2 — Vibe Host + GitHub
    share/                      # Phase 3 — đăng bài & lan tỏa
    survey/                     # CP6 — phiếu trải nghiệm
    results/                    # Kết quả + phản biện (CP7)
    leaderboard/                # Bảng xếp hạng theo bảng
  admin/                        # Khu vực BTC/BGK (bảo vệ bởi middleware)
    page.tsx                    # Dashboard tổng: StatTile + bảng thí sinh (gộp menu cũ)
    topics/                     # Duyệt đề tài cuốn chiếu
    scoring/                    # Bảng tổng quan điểm Phase 1-2 (scoring-table.tsx)
      [id]/                     # Chi tiết 1 bài: xác nhận/điều chỉnh điểm máy, feedback
    security/                   # Cổng CP4 — bảng + modal rà soát (security-table.tsx)
    posts/                      # Duyệt bài, nhập engagement, công bố — modal 3 bước (posts-table.tsx)
    appeals/                    # Xử lý phản biện (appeals-table.tsx)
  api/
    auth/{signup,login,logout,me}/route.ts
    submissions/route.ts                          # candidate: tạo/xem đề tài
    submissions/[id]/{phase2,phase3,survey,appeals}/route.ts
    admin/submissions/route.ts                     # list toàn bộ (admin/judge)
    admin/submissions/[id]/{approve,reject,feedback,security,
                             approve-post,engagement,publish,manual-score}/route.ts
    admin/appeals/{route.ts,[id]/route.ts}
    integrations/scores/route.ts                   # hệ chấm điểm ngoài đẩy điểm vào
    integrations/submissions/[id]/route.ts         # hệ chấm điểm ngoài ĐỌC bài + PRD (không lộ danh tính)
lib/
  db/
    schema.ts                  # Drizzle schema (7 bảng, xem docs/PRD.md mục 6).
                                # submissions: + prd_content/prd_file_name (đầu vào Phase 1),
                                # + btc_feedback/feedback_status/kpi3p_flag (chuyển từ product_scores —
                                # quyết định CHUNG của BTC, không phải cờ riêng của một phiếu chấm),
                                # final_score: integer -> real (trung bình nhiều giám khảo ra .5).
                                # idea_scores/product_scores: + judge_id (null = hệ chấm ngoài) với
                                # unique(submission_id, judge_id) — mỗi giám khảo đúng một phiếu.
    queries/                   # DB query layer tập trung theo domain
      submissions.ts, scores.ts, appeals.ts, surveys.ts, seasons.ts
    seed.ts                    # Seed dev (pnpm db:seed)
  auth/
    password.ts                # bcrypt — Node-only
    session.ts                 # jose JWT — Edge-safe
  api-auth.ts                  # requireSession() helper cho route handlers
  github.ts                    # verify GitHub collaborator (Phase 2)
  scoring.ts                   # tính bậc lan tỏa + final score (pure functions)
  checkpoints.ts              # CP1-CP6 — một nguồn sự thật cho gate công bố
  appeal-policy.ts            # cửa sổ phản biện 48h + một lần duy nhất
  score-visibility.ts         # luật hiện điểm cho thí sinh (judges/external_ai/none)
middleware.ts                  # bảo vệ /dashboard/* + /admin/*, role gate
components/
  ui/                          # Component nền tảng port từ dsvh (xem docs/design.md)
  auth-card.tsx, logout-button.tsx
drizzle/                       # Generated migrations
docs/
  reference/                   # Thể lệ v3, wireframe gốc, source dsvh đầy đủ
```

## Key Decisions
- Drizzle thay vì Prisma: lightweight, TypeScript-native, no codegen engine.
- JWT qua `jose` thay vì NextAuth/`jsonwebtoken`: cần Edge-safe cho middleware + dễ swap
  MS365 OAuth ở Phase 2 mà không phụ thuộc 1 thư viện auth framework nặng.
- Không tự chấm điểm/tích hợp Facebook Graph API/tự cấp Vibe Host trong app này — đây là
  quyết định phạm vi đã chốt với user (xem docs/PRD.md mục 7-8), KHÔNG phải thiếu sót.
- `lib/db/queries/*` tập trung mọi câu query — route handlers chỉ gọi hàm, không tự viết
  Drizzle query rải rác (theo convention `CLAUDE.md`).
- Standalone output cho Docker image nhỏ (< 200MB).
- Server Components mặc định — reduce client JS bundle; client component chỉ ở
  form/nút bấm cần state.
