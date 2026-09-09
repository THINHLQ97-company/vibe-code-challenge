# API: matbao-vibe-challenge

Next.js App Router API routes.

## Endpoints

### GET /api/health
Healthcheck — verify app + DB connection.

**Response 200**:
```json
{ "status": "ok", "db": "ok", "uptime_ms": 42 }
```

**Response 503** khi DB down:
```json
{ "status": "degraded", "db": "error", "uptime_ms": 42 }
```

## Adding new endpoint

1. Create `app/api/<path>/route.ts`
2. Export `GET`, `POST`, `PUT`, `DELETE` functions
3. Validate input với Zod
4. Update this doc

Example:
```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateUser = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = CreateUser.parse(await req.json());
  // ... insert into DB
  return NextResponse.json({ ok: true });
}
```
