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
409 nếu đã có đề tài đang xử lý (status khác `returned`). Bắt buộc kèm PRD làm căn cứ
chấm Phase 1: `prdContent` (nội dung markdown/text, 200–200 000 ký tự) + `prdFileName`
(tên file gốc, thí sinh đọc file `.md`/`.txt` ngay ở trình duyệt rồi gửi nội dung — app
không lưu file nhị phân).

### POST /api/submissions/:id/phase2
Role `candidate`, phải là chủ sở hữu submission. Body: `{ vibehostUrl, githubRepoUrl }`.
Tự động gọi GitHub API verify `matbao-vibe-bot` đã được add collaborator — trả
`{ submission, githubVerified, githubError? }`.

### POST /api/submissions/:id/phase3
Body: `{ facebookPostUrl }`. Yêu cầu đã nộp Phase 2 (`vibehostUrl` khác null) — 409 nếu
chưa. Sau khi BGK duyệt bài (`facebookApprovedAt` đã set) thì KHÔNG cho đổi link nữa —
409 "Bài đăng đã được BTC duyệt, không đổi link được nữa".

### POST /api/submissions/:id/survey
Body: `{ common: string[6], boardSpecific: string[4] }`.

### POST /api/submissions/:id/appeals
Body: `{ criteria, evidenceUrl }`. Cổng chặn dùng chung với `/dashboard/results`
(`lib/appeal-policy.ts`): chỉ mở khi đã `publishedAt`, trong vòng 48h kể từ lúc công bố,
và mỗi bài đúng **một lần** — gọi lần hai hoặc quá hạn đều 409.

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
Body: `{ count }`. Bắt buộc `facebookApprovedAt` đã set (CP5 — duyệt bài đăng) trước,
409 nếu chưa — đếm tương tác một bài chưa duyệt sẽ kéo lệch trung vị của cả nhóm. Tự
tính bậc điểm 1-4 theo trung vị cùng tuần (`lib/scoring.ts#engagementTierFromCount`).

### POST /api/admin/submissions/:id/publish
Role `admin`. Chặn công bố lại — 409 "Bài này đã công bố kết quả" nếu `publishedAt` đã
set. Kiểm đủ **CP1–CP6** một lượt (`lib/checkpoints.ts#missingCheckpoints`, không chỉ
CP4+CP5 như trước), 409 kèm danh sách `missing` nếu thiếu mốc nào. Điểm chốt lấy từ
`getAggregatedScores()` (`lib/db/queries/scores.ts`) — **trung bình các phiếu giám
khảo**, chỉ rơi về điểm hệ chấm ngoài khi chưa giám khảo nào chấm tay; 409 nếu chưa có
cả điểm Phase 1 lẫn Phase 2. Tính `finalScore` (`lib/scoring.ts#computeFinalScore`), set
`publishedAt`. Response kèm `scoreBasis` (breakdown từng module + nguồn điểm).

### POST /api/admin/submissions/:id/manual-score
**Fallback** khi chưa có hệ chấm điểm ngoài — admin/judge tự nhập điểm (`source="judge"`),
`judgeId` lấy từ session (không nhận từ body). Mỗi giám khảo đúng **một phiếu** cho mỗi
bài/phase: gọi lại là SỬA phiếu cũ của chính người đó (`findJudgeIdeaScore`/
`findJudgeProductScore` + update), không tạo phiếu mới — tránh một giám khảo tự nhân đôi
trọng số trong điểm trung bình. Body: `{ phase: 1|2, moduleScores: Record<string, number>, summary? }`.

### GET /api/admin/appeals · POST /api/admin/appeals/:id
List + resolve phản biện. Body resolve: `{ status: "accepted"|"rejected", note }`.
`status="accepted"` gọi thêm `reopenForRescore()` (`lib/db/queries/submissions.ts`): xoá
`publishedAt`/`finalScore` của bài để hội đồng chấm lại rồi công bố lại — nếu chỉ ghi kết
luận mà không mở lại, điểm cũ vẫn treo trên BXH và cổng chặn "đã công bố" khoá luôn
đường sửa. Response kèm `reopened: boolean`.

## Integration — hệ chấm điểm AI ngoài

### GET /api/integrations/submissions/:id
**KHÔNG dùng cookie session** — auth bằng header `X-API-Key` = env `SCORING_API_KEY`,
so khớp bằng `timingSafeEqual` (không dùng `!==`, để không lộ khoá qua thời gian phản
hồi dò từng ký tự). Cho hệ chấm ngoài ĐỌC dữ liệu bài + PRD trước khi đẩy điểm về —
trước đây chỉ có chiều đẩy điểm vào nên bộ chấm không có cách nào lấy tài liệu để chấm
Phase 1. **Không trả danh tính thí sinh** (không có tên/email), chỉ trả:
```json
{
  "submission": {
    "id": 12, "currentPhase": 2, "board": "ky_thuat", "branch": "A",
    "topicGroup": "...", "productName": "...",
    "problemDesc": "...", "targetUsers": "...", "features": ["..."],
    "databasePlan": "...", "prd": "<nội dung markdown>", "prdFileName": "de-xuat.md",
    "vibehostUrl": "...", "githubRepoUrl": "...", "githubVerified": true,
    "hasWorkflow": true, "workflowDesc": "...", "isPrebuiltRepo": false,
    "technicalCap": 40
  }
}
```
`technicalCap` = 20 nếu `isPrebuiltRepo` — trả sẵn trần để bộ chấm không trả điểm vượt
trần rồi bị `computeFinalScore` cắt lặng lẽ. 401 nếu API key sai, 404 nếu id không tồn tại.

### POST /api/integrations/scores
**KHÔNG dùng cookie session** — auth bằng header `X-API-Key` = env `SCORING_API_KEY`,
so khớp bằng `timingSafeEqual` (cùng cơ chế với endpoint GET ở trên).

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
