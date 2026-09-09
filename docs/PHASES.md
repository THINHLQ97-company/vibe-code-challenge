# Phases: matbao-vibe-challenge

Track AI Factory phase progress. Cập nhật bằng `/vibe phase`.

## Phase 1: Discovery (≤5 ngày, BA team)
Status: in_progress

- [ ] PRD đầy đủ 10 sections
- [ ] Core user journeys implemented
- [ ] Mock/seed data
- [ ] docker compose up chạy OK
- [ ] README + ARCH + API đầy đủ

→ Khi xong chạy `/vibe handoff`

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
