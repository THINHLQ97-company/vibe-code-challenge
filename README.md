# matbao-vibe-challenge

Next.js 15 fullstack app với Drizzle ORM + Postgres.

## Quick Start

```bash
cp .env.example .env
docker compose up -d
# App: http://localhost:3000
# Health: http://localhost:3000/api/health
```

## Development

```bash
pnpm install
pnpm dev
```

## Database

```bash
# Schema change → generate migration
pnpm db:generate

# Apply migration
pnpm db:migrate
```

## Deploy

- Preview (tạm thời): `/deploy-preview` trong Claude Code
- Staging (persistent): `/deploy-beta` → https://matbao-vibe-challenge.mk.dev.matbao.ai

## Docs

- [PRD](./docs/PRD.md)
- [Architecture](./docs/ARCH.md)
- [API](./docs/API.md)
- [Phases](./docs/PHASES.md)

## Team
mk team. Xem CLAUDE.md cho conventions.
