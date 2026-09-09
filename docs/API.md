# API: matbao-vibe-challenge

Next.js App Router API routes. Auth qua cookie httpOnly `vcc_token` (JWT) trừ khi ghi chú khác.

## Health

### GET /api/health
```json
{ "status": "ok", "db": "ok", "uptime_ms": 42 }
```

## Auth

### POST /api/auth/signup
Body: `{ name, email (@matbao.com), password (>=8), department, employeeCode? }` → tạo user
role `candidate`, set cookie session. 409 nếu email đã tồn tại.

### POST /api/auth/login
Body: `{ email, password }` → set cookie session.

### POST /api/auth/logout
Xoá cookie session.

### GET /api/auth/me
Trả `{ user }` (null nếu chưa đăng nhập) — dùng để client tự kiểm tra session.

## Submissions (thí sinh)

### GET /api/submissions
Yêu cầu đăng nhập. Trả `{ submission }` — đề tài hiện tại của user (mới nhất theo
`createdAt`), `null` nếu chưa đăng ký.

### POST /api/submissions
Role `candidate`. Tạo đề tài mới (xem `lib/db/schema.ts#submissions` cho đầy đủ field).
409 nếu đã có đề tài đang xử lý (status khác `returned`).

### POST /api/submissions/:id/phase2
Role `candidate`, phải là chủ sở hữu submission. Body: `{ vibehostUrl, githubRepoUrl }`.
Tự động gọi GitHub API verify `matbao-vibe-bot` đã được add collaborator — trả
`{ submission, githubVerified, githubError? }`.

### POST /api/submissions/:id/phase3
Body: `{ facebookPostUrl }`.

### POST /api/submissions/:id/survey
Body: `{ common: string[6], boardSpecific: string[4] }`.

### POST /api/submissions/:id/appeals
Body: `{ criteria, evidenceUrl }`.

## Admin/BGK (role `admin` hoặc `judge` trừ khi ghi chú)

### GET /api/admin/submissions
List toàn bộ submission kèm `user`.

### POST /api/admin/submissions/:id/approve
Role `admin`. Chặn nếu đã đạt trần `season.capPerWeek` đề tài duyệt trong tuần
(`lib/db/queries/submissions.ts#countApprovedThisWeek`).

### POST /api/admin/submissions/:id/reject
Role `admin`. Body: `{ note }` (bắt buộc).

### POST /api/admin/submissions/:id/feedback
Body: `{ feedback, status: "needs_fix"|"approved" }`. `approved` → set `kpi3pFlag=true`,
chuyển `currentPhase=3`.

### POST /api/admin/submissions/:id/security
Body: `{ status: "clean"|"flagged", note? }`.

### POST /api/admin/submissions/:id/approve-post
Không body — set `facebookApprovedAt=now()`.

### POST /api/admin/submissions/:id/engagement
Body: `{ count }`. Tự tính bậc điểm 1-4 theo trung vị cùng tuần
(`lib/scoring.ts#engagementTierFromCount`).

### POST /api/admin/submissions/:id/publish
Role `admin`. Yêu cầu: `securityStatus="clean"`, `facebookApprovedAt` đã set, có cả
idea score và product score. Tính `finalScore` (`lib/scoring.ts#computeFinalScore`), set
`publishedAt`.

### POST /api/admin/submissions/:id/manual-score
**Fallback** khi chưa có hệ chấm điểm ngoài — admin/judge tự nhập điểm (`source="judge"`).
Body: `{ phase: 1|2, moduleScores: Record<string, number>, summary? }`.

### GET /api/admin/appeals · POST /api/admin/appeals/:id
List + resolve phản biện. Body resolve: `{ status: "accepted"|"rejected", note }`.

## Integration — hệ chấm điểm AI ngoài

### POST /api/integrations/scores
**KHÔNG dùng cookie session** — auth bằng header `X-API-Key` = env `SCORING_API_KEY`.

Đây là điểm tích hợp CHƯA CHỐT chính thức với đội build bộ chấm điểm (xem
`docs/PRD.md` mục 4/7) — payload dưới đây là đề xuất, có thể cần điều chỉnh.

Body:
```json
{
  "submissionId": 12,
  "phase": 1,
  "moduleScores": { "giaTriUngDung": 22 },
  "summary": "Bài toán thật, khả thi trong hạn."
}
```
`phase: 2` dùng `moduleScores: { "chatLuongKyThuat": 34, "hoanThien": 12 }`.

Response: `{ ideaScore }` hoặc `{ productScore }`. 401 nếu API key sai, 404 nếu
`submissionId` không tồn tại.

## GitHub verify (Phase 2)

`lib/github.ts#verifyGithubAccess` — dùng `GITHUB_BOT_PAT` (PAT của machine-user
`matbao-vibe-bot`) gọi `GET https://api.github.com/repos/{owner}/{repo}`. 200 = đã có
quyền truy cập (thí sinh đã add đúng collaborator); 404 = chưa add hoặc repo không tồn
tại. **Action item trước launch**: tạo tài khoản `matbao-vibe-bot` + sinh PAT, set vào
env `GITHUB_BOT_PAT`.
