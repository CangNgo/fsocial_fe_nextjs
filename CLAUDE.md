# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Next.js 16 (App Router, Turbopack) social-network web client, organized as feature modules. TypeScript strict mode throughout.

> **Next.js 16 breaking changes:** this repo uses `src/proxy.ts` — Next 16 renamed Middleware to Proxy, and the API differs from what you may know as `middleware.ts`. Do NOT create or edit a `middleware.ts` file. If unsure about any Next.js 16 API, check `node_modules/next/dist/docs/` rather than relying on training-data knowledge — this version has breaking changes.

## Commands

```bash
yarn dev          # dev server with Turbopack
yarn build        # production build
yarn start        # run production build
yarn check        # prettier --write ./src && eslint ./src --fix (preferred over lint/format separately)
yarn lint         # eslint ./src
yarn lint:fix     # eslint ./src --fix
yarn format       # prettier --write ./src
yarn type-check   # tsc --noEmit
yarn analyze      # ANALYZE=true next build (bundle analysis)
pnpm dlx shadcn@latest add <name>   # add a shadcn primitive into src/shared/components/ui
```

- Package manager is `yarn` (`packageManager: yarn@1.22.22` in `package.json`), despite a stray `pnpm-workspace.yaml`.
- There is no test runner configured in this repo.
- Prettier (`.prettierrc.json`) formats; ESLint (`eslint.config.mjs`, based on `eslint-config-next`) lints — this replaced Biome, which was removed. `eslint-config-prettier` disables ESLint formatting rules so the two tools never fight over the same line.
- Pre-commit: Husky + lint-staged (`*.{ts,tsx}` → `prettier --write` then `eslint --fix`, `*.{json,css,md}` → `prettier --write`). Commit messages follow Conventional Commits, enforced by commitlint.

## Architecture

### Dependency direction (one-way, enforced)

```
app/  →  features/<x>/  →  shared/
```

- `shared/` must never import from `features/`.
- Features must not import another feature's internals — anything needed by 2+ features belongs in `shared/`.
- Cross-layer imports always use the `@/` alias; avoid deep relative imports (`../../../`).

| Layer                  | Responsibility                                                                                                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`             | Routing only — thin pages/layouts that compose a feature's top-level component. Route groups `(auth)`, `(user)`, `(admin)` express access boundaries, not feature ownership; access is enforced in `src/proxy.ts`, not duplicated per-page. |
| `src/features/<name>/` | Self-contained domain module: `api/`, `components/{atoms,molecules,organisms,pages}/`, `hooks/`, `stores/`, `types/`, `utils/`, plus `schemas/`/`config/` where relevant. Public surface exported through `index.ts`.                       |
| `src/shared/`          | Infrastructure and code reused by 2+ features (axios setup, query client, cross-cutting Zustand stores, shadcn UI primitives, route config).                                                                                                |

Current feature modules: `admin, auth, follow, home, message, post, profile, search, setting`.

### Auth/role gate (`src/proxy.ts`)

Reads `access-token`/`refresh-token` cookies, decodes the JWT with `jwt-decode` to get `scope` (role) and expiry, then redirects based on `GUEST_ONLY_PATHS`, `USER_PATHS`, and `ROUTES.ADMIN.PREFIX` (all defined in `src/shared/config/routes.ts`). Do not duplicate this redirect logic elsewhere unless there's a real need.

### API layer — two tiers, not one

All HTTP calls go through the non-throw wrappers in `src/shared/api/core/api-service.ts` (`apiGet/apiPost/apiPut/apiPatch/apiDelete`). Never import `axios` or the axios instance directly outside `src/shared/api/core/`.

- `src/shared/api/core/axios-instance.ts` — the single axios instance. Request interceptor attaches `Authorization: Bearer <token>` from the `access-token` cookie except for `PUBLIC_ENDPOINTS` (login/register/otp). Response interceptor handles 401 by refreshing via `POST /auth/refresh-token`, queuing concurrent requests while a refresh is in flight, and dispatching a `window` event `auth:expired` if the refresh itself fails.
- `src/shared/api/core/api-service.ts` — **non-throw** contract: on failure, returns `error.response.data` or a caller-supplied fallback/`null`, it never throws. Callers must treat a falsy/`null` return as the failure case instead of wrapping calls in `try/catch`.
- `src/shared/api/{admin,auth,notifications,posts,profile,routes}/` — API calls shared across 2+ features (e.g. `posts-api.ts` is used by `home`, `follow`, `post`, and `profile`).
- `src/features/<x>/api/` — API calls owned by and used only within a single feature (e.g. `auth/api/login-api.ts`, `message/api/message-api.ts`).

When adding a new API call, put it in `features/<x>/api/` unless it's already needed by another feature, in which case it belongs under `shared/api/`.

### State management

- **Server state → TanStack Query.** Query client factory: `src/shared/lib/query-client.ts` (`getQueryClient()` — new client per request on the server, singleton in the browser). Defaults: `staleTime: 5m`, `gcTime: 10m`, `retry: 2` (`0` for mutations), `refetchOnWindowFocus: false`. Query hooks live in `features/<x>/hooks/`; keys colocate with the feature (see `src/shared/lib/query-keys.ts` and `src/shared/keys/post.key.ts` for examples).
- **Client/global state → Zustand.** Cross-cutting stores live in `src/shared/stores/` (`admin-store`, `message-store`, `notification-store`, `owner-account-store`, `popup-store`, `theme-store`, `valid-refresh-token-store`) — they're in `shared` specifically because the axios interceptor and proxy-adjacent code depend on them, and `shared` can't import from `features`. Feature-local stores go in `features/<x>/stores/` (most are currently empty placeholders; `home` is the one feature actually using a store today, at `features/home/store/timeline-store.ts` — note the singular `store/`, inconsistent with the `stores/` directory name used elsewhere).
- Never put server-fetched data into Zustand — that's TanStack Query's job.

### Providers

`src/shared/components/providers.tsx` composes `QueryClientProvider → ThemeProvider → children`, plus a `sonner` `Toaster` and `ReactQueryDevtools` (dev only). Mounted once from the root `layout.tsx`.

## Conventions

| Artifact                    | Convention             | Example             |
| --------------------------- | ---------------------- | ------------------- |
| Files                       | `kebab-case`           | `login-form.tsx`    |
| Components                  | `PascalCase` export    | `LoginForm`         |
| Hooks                       | `use-kebab-case.ts`    | `use-login-form.ts` |
| API/store/schema/type files | `kebab-case.ts`        | `timeline-store.ts` |
| Props interfaces            | `ComponentNameProps`   | `StoryItemProps`    |
| Constants                   | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_COUNT`   |

- No `any` — use `unknown`, generics, or type guards.
- No hardcoded route strings — use `ROUTES` from `src/shared/config/routes.ts`.
- Forms are schema-first: Zod schema + `zodResolver`, form values typed via `z.infer`.
- Server Components by default; add `"use client"` only when state/effects/handlers/browser APIs are actually needed.
