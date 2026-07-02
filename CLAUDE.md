# Next.js Web App — AI Agent Rules

Hướng dẫn cho Claude Code khi làm việc trong repo này. App web feature-modular, Next.js 16 App Router.

> **Next.js 16:** repo dùng `src/proxy.ts` — KHÔNG phải `middleware.ts` (Next 16 đổi tên Middleware → Proxy; API giữ nguyên). Với API Next.js chưa chắc chắn, đọc `node_modules/next/dist/docs/` thay vì kiến thức huấn luyện cũ — bản này có breaking changes.

---

## Tech Stack

### Core

- **Framework:** Next.js 16 (App Router, Turbopack), TypeScript (strict)
- **Proxy/Auth gate:** `src/proxy.ts` — redirect theo auth/role (JWT cookie)
- **Server state:** TanStack Query v5
- **Client state:** Zustand
- **UI:** shadcn/ui (style `new-york`, base `zinc`, RSC + TS) + Tailwind CSS v4
- **HTTP:** axios — instance duy nhất + lớp `apiService` (không-throw)
- **Realtime:** STOMP (`@stomp/stompjs`) cho notification/message
- **Lint/format:** Biome (KHÔNG dùng ESLint/Prettier), config `biome.json`

### External Integrations

- **Auth:** JWT access/refresh-token qua cookie, tự refresh khi 401
- **OAuth:** Google OAuth (`oauth2/` callback)

---

## Commands

```bash
pnpm dev          # dev server (turbopack), port 3002
pnpm build        # build production
pnpm start        # chạy bản build production
pnpm check        # biome lint + format --write ./src  (ưu tiên cái này)
pnpm lint:fix     # biome lint --write ./src
pnpm type-check   # tsc --noEmit
pnpm analyze      # ANALYZE=true next build (bundle size)
pnpm dlx shadcn@latest add <name>   # thêm UI primitive vào shared/components/ui
```

Chưa có test runner. Pre-commit (Husky + lint-staged) chạy `biome check`; commit message theo Conventional Commits (commitlint).

---

## Project Structure

```
src/
├── app/                      # CHỈ routing — page mỏng, chỉ render một feature component
│   ├── (auth)/ (user)/ (admin)/   # route groups; quyền truy cập do proxy.ts thực thi
│   ├── oauth2/               # callback Google OAuth
│   └── layout.tsx            # mount <Providers> từ @/shared
├── proxy.ts                  # Next 16 Proxy
│
├── features/<feature>/       # admin, auth, follow, home, message, post, profile, search, setting
│   ├── components/           # atomic design TRONG feature: atoms|molecules|organisms
│   │   └── <Name>/<Name>.tsx + index.ts
│   ├── api/<x>Api.ts         # gọi apiService — KHÔNG gọi axios trực tiếp
│   ├── hooks/queries|mutations/   # React Query hook của feature
│   ├── store/                # Zustand store riêng feature (vd message, notification)
│   ├── types/  utils/        # type & helper riêng feature
│   └── index.ts              # ⭐ barrel — public API của feature
│
└── shared/                   # tái sử dụng ở ≥2 feature
    ├── components/
    │   ├── ui/               # shadcn primitive (atoms) — CLI cài vào đây
    │   ├── molecules/ organisms/ templates/
    │   ├── Providers.tsx     # QueryClient → Theme → GoogleOAuth → {children} + Toaster
    │   └── ThemeProvider.tsx
    ├── api/                  # axiosInstance, apiService, tokenManager
    ├── lib/                  # queryClient (factory), utils (cn())
    ├── hooks/  store/        # hook generic; store phiên + UI toàn cục
    ├── config/               # routes.ts, *NavRoute.tsx, globalVariables.ts, regex.ts
    ├── types/  utils/        # type domain & helper thuần dùng chung
```

| Folder | Vai trò |
| --- | --- |
| `app/` | Routing thuần. Page mỏng, KHÔNG business logic. |
| `features/<x>/` | UI + logic riêng một tính năng. Tự sở hữu api/hooks/store/types/utils/components. |
| `shared/` | Dùng lại ở ≥2 feature. Hạ tầng (axios, queryClient, store phiên) sống ở đây. |
| `shared/store/` | `ownerAccountStore`, `adminStore`, `themeStore`, `popupStore`, `validRefreshTokenStore` (vì axios interceptor phụ thuộc, mà `shared` không được import `features`). |

---

## Dependency Rules (immutable)

- Chiều phụ thuộc MỘT chiều: `app → features → shared`.
- Feature KHÔNG import internals của feature khác → cái gì dùng chung đẩy lên `shared/`.
- `shared/` KHÔNG BAO GIỜ import từ `features/`.
- Luôn dùng alias `@/`; cấm path tương đối sâu (`../../../`).

---

## Conventions

### API

- Mọi call qua `apiGet/apiPost/apiPut/apiPatch/apiDelete` ở `@/shared/api/apiService`. KHÔNG import `axios`/instance ngoài `shared/api`.
- apiService **KHÔNG BAO GIỜ throw** — lỗi trả `error.response.data` hoặc `fallback`/`null`. Coi `null`/falsy là lỗi; KHÔNG bọc try/catch.
- File API trong feature: `features/<x>/api/<x>Api.ts`, đặt tên `getX/createX/updateX/deleteX`.

### State

- **Server state → React Query.** Hook ở `features/<x>/hooks/`. QueryClient factory ở `@/shared/lib/queryClient` (staleTime 5', gcTime 10', retry 2, `refetchOnWindowFocus` false). Query key colocate trong feature.
- **Client/global state → Zustand.** Store gắn 1 feature → trong feature; store phiên + UI toàn cục → `shared/store/`. Mỗi store export kép: hook `useXStore` + reference thuần `xStore` (dùng ngoài React). Luôn select slice tối thiểu, không subscribe cả store.

### UI

- Server Component mặc định; thêm `"use client"` chỉ khi cần state/effect/handler.
- Primitive shadcn cài qua CLI vào `shared/components/ui`. Ghép class bằng `cn()` (`@/shared/lib/utils`).
- Tailwind v4 + biến CSS theme (`themeStore`/`ThemeProvider`); SCSS module cho style cục bộ; SVG import như component (`@svgr`).

### Code style (mọi nơi)

- Commit: `<type>(<scope>): <subject>` — Conventional Commits, subject viết thường.
- Types: `feat | fix | refactor | style | test | docs | chore | perf | ci | revert`.
- KHÔNG magic number — tách ra hằng số có tên (`shared/config`).
- KHÔNG dùng `any` — dùng `unknown` + type guard hoặc generic.
- Route: dùng `ROUTES.X()` (`@/shared/config/routes`) thay hardcode path string.

---

## Examples

### Thêm feature mới (vd `bookmark`)

```
src/features/bookmark/
├── api/bookmarkApi.ts
├── hooks/queries/useBookmarks.ts
├── components/BookmarkList/BookmarkList.tsx + index.ts
└── index.ts          # export { BookmarkList } from "./components/BookmarkList";
```

```tsx
// src/app/(user)/bookmark/page.tsx — page mỏng
import { BookmarkList } from "@/features/bookmark";
export default function Page() { return <BookmarkList />; }
```

### API service (không-throw)

```ts
// src/features/bookmark/api/bookmarkApi.ts
import { apiGet, apiPost } from "@/shared/api/apiService";

export const getBookmarks = (userId: string, page = 0) =>
  apiGet(`/bookmark?userId=${userId}&page=${page}`);

export const addBookmark = (postId: string) =>
  apiPost("/bookmark", { postId });

// Gọi: const res = await getBookmarks(id); if (!res) { /* xử lý lỗi */ }
```

### Query hook (key colocate trong feature)

```ts
// src/features/bookmark/hooks/queries/useBookmarks.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { getBookmarks } from "../../api/bookmarkApi";

export const bookmarkKeys = { list: (id: string) => ["bookmarks", id] as const };

export function useBookmarks(userId: string) {
  return useQuery({
    queryKey: bookmarkKeys.list(userId),
    queryFn: () => getBookmarks(userId),
    enabled: !!userId,
  });
}
```

### Zustand store (export kép)

```ts
// src/features/bookmark/store/bookmarkStore.ts
import { create } from "zustand";

interface BookmarkState { ids: string[]; add: (id: string) => void; }

export const useBookmarkStore = create<BookmarkState>()((set) => ({
  ids: [],
  add: (id) => set((s) => ({ ids: [...s.ids, id] })),
}));

export const bookmarkStore = useBookmarkStore;  // dùng ngoài React (vd interceptor)
```

---

## Agent Skills

Skills định nghĩa ở `.claude/skills/`. Đọc và áp dụng tự động theo ngữ cảnh — không cần chờ gọi `/command`. Đọc file skill im lặng trước khi trả lời, không thông báo.

| Skill | File | Áp dụng khi |
| --- | --- | --- |
| `/new-feature` | `.claude/skills/new-feature/SKILL.md` | Tạo feature module mới (api/hooks/store/components + barrel) |
| `/ui` | `.claude/skills/ui/SKILL.md` | Thêm/sửa component shadcn, atomic design, styling, theme |
| `/api-service` | `.claude/skills/api-service/SKILL.md` | Viết service API mới theo lớp apiService không-throw |

---

## Scope Enforcement (DO NOT)

- KHÔNG gọi `axios`/instance trực tiếp ngoài `shared/api` — luôn qua `apiService`.
- KHÔNG để server-data trong Zustand (đó là việc của React Query).
- KHÔNG import internals chéo feature; `shared/` KHÔNG import `features/`.
- KHÔNG hardcode path string — dùng `ROUTES`.
- KHÔNG dùng `any`; KHÔNG để business logic trong `app/`.
- KHÔNG tạo/sửa `middleware.ts` — repo dùng `proxy.ts`.

---

Tham chiếu (không copy nội dung): @package.json (scripts), @biome.json (lint/format), @components.json (shadcn).