# CLAUDE.md — matbao-vibe-challenge

## Context
- Project: matbao-vibe-challenge
- Team: mk
- Stack: Next.js 15 (App Router) + Drizzle + Postgres 16
- Domain: https://matbao-vibe-challenge.mk.dev.matbao.ai

## Stack versions (PIN — do not upgrade without team-lead approval)
- Next.js 15.0.3 (stable, CVE-patched)
- React 19.0.0
- Drizzle ORM 0.36.4
- Postgres 16-alpine
- Node 22-alpine

## Conventions
- TypeScript strict mode — no `any`
- Server Components mặc định; `"use client"` chỉ khi cần interactivity
- File routing theo `app/**` convention
- API routes trong `app/api/**/route.ts`
- DB queries TẬP TRUNG trong `lib/db/` — không query rải rác components
- Server Actions cho mutations khi có thể
- Zod validate TOÀN BỘ input trước khi xử lý

## Database
- Schema: `lib/db/schema.ts` (Drizzle)
- Migrations: `drizzle/` — generate bằng `pnpm db:generate`
- Connection: `lib/db/index.ts` (singleton, pool size 10)

## Testing
- Unit: Vitest
- E2E: Playwright (optional cho iMVP, bắt buộc cho production)
- Coverage target: >70%

## Deploy
- `/deploy-preview` cho quick preview
- `/deploy-beta` cho persistent staging
- Production: qua Coolify sau Gate 2

## Commands
```bash
docker compose up -d        # Local dev với DB
pnpm dev                    # Next.js dev server
pnpm db:generate            # Gen migrations từ schema
pnpm db:migrate             # Apply migrations
pnpm test                   # Run tests
```

## Rules
- KHÔNG hardcode secrets — dùng .env / Coolify env vars
- KHÔNG commit .env
- Migration file sinh ra từ schema CHANGE → commit cùng với schema
- Breaking API change → bump version trong CHANGELOG.md
