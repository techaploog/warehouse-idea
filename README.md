# Warehouse Idea

A small warehouse management app I'm building to learn modern full-stack patterns end to end.

**Stack:** Next.js (frontend) + NestJS on Fastify (backend) + Drizzle ORM, with a shared Zod contract package keeping both sides honest.

## Status

In active development. Things will move and break.

## Repo layout

```text
.
├─ frontend/                  # Next.js 16 app (UI)
├─ backend/                   # NestJS 11 API (Fastify) + Drizzle ORM
└─ packages/
   └─ shared/                 # @warehouse/shared (Zod schemas + inferred types)
```

## What lives where

- **backend** owns the database schema (Drizzle), migrations, data access, and the HTTP API.
- **packages/shared** owns the API contract: request/response Zod schemas and the TypeScript types inferred from them.
- **frontend** owns the UI, forms, and client-side validation. It consumes the shared schemas instead of redefining payload shapes.

The rule of thumb: if a shape crosses the network boundary, it belongs in `@warehouse/shared`.

## Prerequisites

- Node.js (current LTS)
- pnpm v10+
- PostgreSQL running locally (or a reachable instance)

## Quick start

From the repo root:

```bash
# 1. Install all workspaces
pnpm install

# 2. Build the shared contract package (frontend & backend depend on its dist)
pnpm build:shared

# 3. Set up the database (see "Database" below for DATABASE_URL)
pnpm --filter backend db:migrate
pnpm --filter backend db:seed

# 4. Run the apps in two terminals
pnpm dev:fe   # http://localhost:3000
pnpm dev:be   # http://localhost:3300
```

API docs (Swagger): http://localhost:3300/api/docs

> Heads up: `db:seed` truncates related tables before inserting. Never run it against a database you care about.

## Scripts cheat sheet

Run these from the repo root unless noted.

| Command                              | What it does                                  |
| ------------------------------------ | --------------------------------------------- |
| `pnpm install`                       | Install all workspace dependencies            |
| `pnpm build:shared`                  | Build `@warehouse/shared` to `dist/`          |
| `pnpm build`                         | Build shared, then frontend, then backend     |
| `pnpm dev:fe`                        | Run the Next.js dev server on `:3000`         |
| `pnpm dev:be`                        | Run the NestJS dev server on `:3300`          |
| `pnpm --filter backend db:generate`  | Generate a new Drizzle migration from schema  |
| `pnpm --filter backend db:migrate`   | Apply pending migrations                      |
| `pnpm --filter backend db:studio`    | Open Drizzle Studio                           |
| `pnpm --filter backend db:seed`      | Seed dev data (truncates target tables first) |
| `pnpm --filter backend db:seed-mock` | Seed mock data                                |
| `pnpm --filter backend lint`         | Lint backend                                  |
| `pnpm --filter frontend lint`        | Lint frontend                                 |

## Shared contracts (Zod)

The shared package exports Zod schemas and DTO types inferred from them:

```ts
import { createProductSchema, type CreateProductDto } from "@warehouse/shared";
```

When you change an API contract:

1. Update the schema in `packages/shared` first and rebuild it.
2. Update backend handlers / validation pipes to consume the shared schema.
3. Update frontend forms and API calls to import the same schema or its inferred type.
4. Update `postman-collection.json` so the collection stays in sync.

This keeps validation rules from drifting between frontend and backend.

## Database (Drizzle, backend only)

Drizzle lives in `backend/src/db`:

- `backend/src/db/schema.ts` — tables
- `backend/src/db/index.ts` — db connection + exports
- `backend/drizzle.config.ts` — drizzle-kit config

Set `DATABASE_URL` for the backend, for example:

```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/warehouse"
```

## Formatting (Prettier on save)

- Shared base config: `prettier.config.mjs` (double quotes)
- Frontend extends it: `frontend/prettier.config.mjs` (adds Tailwind class sorting)
- VS Code: `.vscode/settings.json` enables format-on-save with Prettier

## Common issues

- **Frontend or backend can't resolve `@warehouse/shared`** — you probably skipped `pnpm build:shared`, or you changed a schema and forgot to rebuild it.
- **Port already in use (`3000` or `3300`)** — another dev server is running. Stop it or change the port.
- **Backend fails on startup with a DB error** — check that PostgreSQL is up and `DATABASE_URL` is set in `backend/.env`.
- **Seed wiped my data** — that's by design. `db:seed` truncates the tables it owns. Use a dev DB.
