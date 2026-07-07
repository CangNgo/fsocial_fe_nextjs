---
name: api-service
description: Create or update API code for this repo using the shared non-throw api-service layer, ApiResponse<T> return types, TanStack Query integration, and per-folder query key files. Use this whenever the task involves adding, refactoring, or reviewing API calls, query hooks, shared API folders, or server-state flow.
allowed-tools: [Read, Glob, Grep, Edit, Write]
---

# API Service Skill

Use this skill whenever you add or modify API-related code in this repository.

The goal is to keep every API change aligned with the repo's real architecture:

- HTTP calls go through `@/shared/api/core/api-service`
- response types follow `@/shared/types/api-response`
- server state flows through TanStack Query, not Zustand
- shared API modules are organized by folder under `src/shared/api/`
- each shared API folder should define query keys in `*.key.ts`
- each shared API folder should also contain a `.ts` file that performs the API calls

## Required rules

### 1. Never call axios directly outside core

All HTTP requests must use one of:

- `apiGet`
- `apiPost`
- `apiPut`
- `apiPatch`
- `apiDelete`

Import them from:

```ts
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from "@/shared/api/core/api-service";
```

Do not import axios or the axios instance anywhere outside `src/shared/api/core/`.

### 2. Return `ApiResponse<T> | null`

API functions should return the concrete non-throw contract used by this repo:

```ts
import type { ApiResponse } from "@/shared/types/api-response";

export const getSomething = async (): Promise<ApiResponse<Something> | null> => {
  return apiGet<Something>("/something");
};
```

Avoid vague return types like `Promise<unknown>` when the response shape is known.

If the API returns a list, type it explicitly:

```ts
Promise<ApiResponse<PostResponse[]> | null>;
```

### 3. Server state must go through TanStack Query

If data is fetched from the server and consumed by UI, prefer TanStack Query hooks instead of fetching inside components or storing fetched payloads in Zustand.

Typical pattern:

1. create or update API call in `src/shared/api/<domain>/...`
2. define query keys in `src/shared/api/<domain>/*.key.ts`
3. consume the API call from a query or mutation hook using TanStack Query
4. invalidate or update cache intentionally after mutations

Do not put server-fetched API data into Zustand.

### 4. Shared API folder structure is required

When a concern belongs in `src/shared/api/<domain>/`, the folder should contain at least:

- `*.key.ts` for query keys
- one `.ts` API file for the HTTP calls

Example:

```text
src/shared/api/posts/
├── post.key.ts
└── posts-api.ts
```

If a shared API folder already exists but has no `*.key.ts`, add one when introducing or cleaning up TanStack Query usage there.

### 5. Keep query keys colocated with the API domain

Prefer query keys near the shared API module instead of scattering them elsewhere.

Good:

```ts
export const postKeys = {
  all: ["posts"] as const,
  detail: (postId: string) => ["posts", "detail", postId] as const,
  comments: (postId: string) => ["posts", "comments", postId] as const,
} as const;
```

Keys should be:

- stable
- deterministic
- grouped by domain
- specific enough for invalidation

Avoid anonymous array literals repeated in many hooks.

## Decision guide: shared API vs feature API

Put the API file in `src/shared/api/<domain>/` when the endpoint or data contract is reused by 2 or more features, or is clearly cross-cutting.

Put it in `src/features/<feature>/api/` when it belongs only to one feature.

Even when an API call stays inside a feature, still follow the same transport contract:

- use `api-service`
- return `ApiResponse<T> | null`
- consume it from TanStack Query when it is server state

## Implementation workflow

When asked to add or refactor API code, follow this sequence:

1. Inspect the nearest existing domain in `src/shared/api/` or `src/features/<feature>/api/`
2. Identify or create concrete response/data types
3. Add or update the API caller using `apiGet/apiPost/apiPut/apiPatch/apiDelete`
4. Ensure the return type is `Promise<ApiResponse<T> | null>`
5. Add or update `*.key.ts` in the same shared API folder when the API is in `src/shared/api/`
6. Create or refactor TanStack Query hooks to call the API layer
7. For mutations, invalidate or update the relevant query keys
8. Keep UI components free of direct transport logic

## Preferred patterns

### Query key file

```ts
export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId: string) => ["profile", "detail", userId] as const,
  followers: (userId: string) => ["profile", "followers", userId] as const,
} as const;
```

### API file

```ts
import { apiGet } from "@/shared/api/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ProfileResponse } from "@/shared/types/profile";

export const getProfile = async (userId: string): Promise<ApiResponse<ProfileResponse> | null> => {
  return apiGet<ProfileResponse>(`/profile/${userId}`);
};
```

### Query hook

```ts
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/shared/api/profile/profile-api";
import { profileKeys } from "@/shared/api/profile/profile.key";

export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getProfile(userId),
    enabled: Boolean(userId),
  });
}
```

## Anti-patterns to remove

If you encounter these while editing API code, fix them when reasonably in scope:

- `Promise<unknown>` for known response shapes
- direct `axios` imports outside `src/shared/api/core/`
- API fetching directly inside components
- storing fetched server data in Zustand
- repeated inline query keys instead of a domain `*.key.ts`
- API helpers in shared folders without colocated query keys
- throwing transport errors manually around `api-service` unless there is a very specific reason

## Review checklist

Before finishing, verify:

- request uses `api-service`
- response type is explicit and based on `ApiResponse<T>`
- query keys exist in `*.key.ts` for shared API domains touched
- TanStack Query is used for server-state orchestration
- no direct axios import was introduced
- no server-state payload was moved into Zustand
- imports use `@/` aliases
- file names follow kebab-case

## Notes for this repository

Reference points already present in the repo:

- `src/shared/api/core/api-service.ts`
- `src/shared/types/api-response.ts`
- `src/shared/api/posts/posts-api.ts`
- `src/shared/keys/post.key.ts` (legacy location; prefer colocating future shared-domain query keys inside `src/shared/api/<domain>/`)
- `src/shared/lib/query-keys.ts` (existing central keys; when changing shared API domains, prefer colocated domain keys if you are introducing new structure)

When both an older pattern and the desired pattern exist, prefer the repo direction requested by the user for new work: shared API folders should include both the API caller file and a `*.key.ts` file.
