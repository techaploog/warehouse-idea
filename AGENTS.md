# Warehouse Idea Project Agent Guide

## Golden Rules

Read these before doing anything else. They override style preferences below.

- **Work incrementally.** Small, simple steps. Validate each step before moving on.
- **Identify the root cause BEFORE fixing.** Prove the problem first, do not guess.
- **No workarounds.** If you cannot find the real cause, stop and say so.
- **`@warehouse/shared` is the single source of truth for any shape that crosses the network boundary.** Do not redefine API payloads in `frontend` or `backend`.
- **Rebuild `@warehouse/shared` after editing it.** Run `pnpm build:shared` before testing frontend or backend, or imports will be stale.

## Project Structure

- `frontend` — **Next.js** `v16.2+`, **React** `v19+`, **Tailwind CSS** `v4`
- `backend` — **NestJS** `v11`, **Fastify** `v5.5`, **Drizzle ORM**
- `packages/shared` — `@warehouse/shared`: Zod schemas, inferred types, API-facing utilities

## Commands

Run from the repo root unless noted.

| Purpose            | Command                                |
| ------------------ | -------------------------------------- |
| Install            | `pnpm install`                         |
| Build shared       | `pnpm build:shared`                    |
| Run frontend (dev) | `pnpm dev:fe` (http://localhost:3000)  |
| Run backend (dev)  | `pnpm dev:be` (http://localhost:3300)  |
| Lint frontend      | `pnpm --filter frontend lint`          |
| Lint backend       | `pnpm --filter backend lint`           |
| Backend tests      | `pnpm --filter backend test`           |
| DB generate        | `pnpm --filter backend db:generate`    |
| DB migrate         | `pnpm --filter backend db:migrate`     |
| DB studio          | `pnpm --filter backend db:studio`      |
| DB seed (dev only) | `pnpm --filter backend db:seed`        |

> `db:seed` truncates the tables it owns. Never run it against a database you care about.

Before spawning a dev server, check the terminals folder — `dev:fe` and `dev:be` may already be running.

## Shared Contracts (`@warehouse/shared`)

- Put request/response Zod schemas in `packages/shared/src/schemas/<feature>.schema.ts`.
- Export schemas and inferred types from `packages/shared/src/index.ts`.
- Frontend imports from `@warehouse/shared`; never re-declare payload shapes locally.
- Backend imports the same schemas; do not recreate equivalent Zod objects or `class-validator` DTOs.

### Change workflow (in this exact order)

1. Update the schema in `packages/shared`.
2. Run `pnpm build:shared`.
3. Update backend handlers / validation pipes to consume the shared schema.
4. Update frontend forms, API calls, and UI types to import the same schema or inferred type.
5. Update `postman-collection.json` to match the new contract.
6. Verify the change end-to-end (see "Verifying changes" below).

Goal: zero validation drift between frontend and backend.

## Frontend

Available at http://localhost:3000.

### Skills to consult

When working on frontend code, consult these skills before writing components:

- `vercel-react-best-practices`
- `frontend-design`

### Conventions

- **UI primitives:** `frontend/components/ui/*` — installed via the shadcn CLI.
- **Reusable composites:** `frontend/components/<feature>/<feature>.component.tsx` (e.g. `app-sidebar/app-sidebar.component.tsx`).
- **Server components by default.** Add `"use client"` only when the component needs state, effects, or browser APIs.
- **Actions / API calls:** `frontend/lib/actions/*`.
- **Hooks:** `frontend/hooks/*`.
- **Utilities:** `frontend/lib/utils/*`.
- **Forms:** `react-hook-form` with a Zod resolver, using the schema from `@warehouse/shared`.
- **API discovery:** use Swagger at http://localhost:3300/api/docs to find endpoints and contracts.

### Do not

- Do not handcraft shadcn primitives. Install them via the shadcn CLI.
- Do not redefine API payload shapes — import from `@warehouse/shared`.
- Do not add `"use client"` to a component that doesn't need it.
- Do not add a new dependency without confirming it's actually needed.

## Backend

Available at http://localhost:3300.

### Skills to consult

When working on backend code, consult these skills:

- `nestjs-best-practices`

### Conventions

- **Module layout:** one feature = one module, with `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts` (move existing flat controllers under their feature module as features grow).
- **Validation:** prefer pipe-based validation at `@Body()`, `@Query()`, and `@Param()` boundaries over calling `schema.parse()` inline in handlers.
- **DTOs:** only for backend-internal communication. Anything crossing the HTTP boundary uses `@warehouse/shared` schemas/types.
- **Drizzle:** schema in `backend/src/db/schema.ts`, connection in `backend/src/db/index.ts`, config in `backend/drizzle.config.ts`.
- **Swagger:** keep `@nestjs/swagger` decorators on controllers up to date — the frontend uses `/api/docs` as the API reference.

### Do not

- Do not duplicate validation rules in controller-local Zod objects when the schema already lives in `@warehouse/shared`.
- Do not create `class-validator` DTOs that mirror a shared Zod schema.
- Do not call `schema.parse()` inline in handlers when a validation pipe will do.
- Do not run `db:seed` against any database you care about.

## Postman Collection

`postman-collection.json` lives at the repo root and must stay in sync with the API.

- One entry per endpoint under `item`, named after the resource/action (e.g. `Items`, `Health`).
- Use the `{{baseUrl}}` variable (defaults to `http://localhost:3300`); never hardcode hosts.
- Path segments go in the `path` array (e.g. `["api", "v1", "items"]`).
- Update this file in the same change as the schema and handler updates.

## Verifying changes

Before declaring a task done:

- **Backend:** hit the endpoint (Swagger at `/api/docs`, Postman, or `curl`) and confirm the response matches the shared schema.
- **Frontend:** open the affected page at http://localhost:3000 and confirm the UI behaves as expected.
- **Contract changes:** verify both sides — a green backend test is not enough if the frontend still sends the old shape.
- **Lint:** run the relevant `lint` command for any package you touched.
- **Build:** if you changed `packages/shared`, confirm `pnpm build:shared` succeeded before testing consumers.
