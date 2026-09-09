# Phases: matbao-vibe-challenge

Track AI Factory phase progress. Cập nhật bằng `/vibe phase`.

## Phase 1: Discovery (≤5 ngày, BA team)
Status: iMVP hoàn tất (10/10 step trong docs/PLAN.md), chưa handoff

- [x] PRD đầy đủ 10 sections (docs/PRD.md)
- [x] Core user journeys implemented — CP1→CP7 + 3-phase chấm điểm chạy end-to-end
- [x] Mock/seed data (`pnpm db:seed` — 5 submission ở nhiều trạng thái khác nhau)
- [x] docker compose up chạy OK
- [x] README + ARCH + API đầy đủ

→ Còn thiếu trước khi handoff thật: hợp đồng API chính thức với đội chấm điểm ngoài,
account `matbao-vibe-bot` GitHub thật (xem docs/PRD.md mục 4/7 — integration point).
Khi xong chạy `/vibe handoff`

## Gate 1: Validation (Head of AI)
Status: pending

→ Manager chạy `/vibe gate1` review

## Phase 2: Productization (1-4 tuần, Dev AI)
Status: pending

- [ ] Refactor
- [ ] Tests (>70% coverage)
- [ ] Security hardening
- [ ] Secrets management
- [ ] DB migrations
- [ ] CI/CD pipeline
- [ ] Logging + monitoring
- [ ] Performance baseline
- [ ] Rollback docs

→ Khi xong chạy `/vibe gate2`

## Gate 2: Production Readiness
Status: pending

→ 6 checkpoints: security / privacy / performance / rollback / monitoring / docs

## Production Deploy
Status: pending

→ `/deploy-beta` cho staging persistent, rồi promote lên production
