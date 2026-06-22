# CLAUDE.md

File này cung cấp hướng dẫn cho Claude Code (claude.ai/code) khi làm việc với mã nguồn trong repository này.

@AGENTS.md

> **Lưu ý về Next.js 16**: Repo này dùng `proxy.ts` (không phải `middleware.ts`) — trong Next 16, Middleware đã được đổi tên thành Proxy. Mục đích/API giữ nguyên, chỉ đổi tên file/quy ước. Trước khi dùng bất kỳ API Next.js nào chưa chắc chắn, hãy kiểm tra `node_modules/next/dist/docs/` thay vì dựa vào kiến thức huấn luyện cũ, vì phiên bản này có breaking changes so với Next.js cũ.

## Cấu trúc thư mục dự án

```
src/
├── app/                  # Next.js App Router — chỉ chứa route, page phải mỏng (thin)
│   ├── (auth)/           # route group: login, signup, forgot-password (chỉ guest)
│   ├── (user)/           # route group: home, follow, message, post/[id], profile, search, setting
│   ├── (admin)/          # route group: /admin/* — trang quản trị
│   ├── oauth2/           # route callback cho Google OAuth
│   ├── layout.tsx        # layout gốc — font, metadata, mount <Providers>
│   └── page.tsx          # entry của route "/"
├── proxy.ts              # Next 16 Proxy (thay cho middleware.ts) — redirect theo auth/role
├── features/             # mỗi feature một folder — đơn vị triển khai tính năng
│   └── <feature>/        # admin, auth, follow, home, message, post, profile, search, setting
│       ├── index.ts      # barrel — re-export component public của feature
│       └── components/<Name>/<Name>.tsx + index.ts   # client component thuộc feature
├── components/           # UI dùng chung, phân lớp theo atomic design (dựa trên shadcn/ui)
│   ├── atoms/            # primitive của shadcn + vài atom tự viết (Icon, JumpingInput)
│   ├── molecules/        # tổ hợp nhỏ (SearchBar, DataTable, MediaGrid, TabPanel...)
│   ├── organisms/         # UI tổ hợp phức tạp, gắn với layout/global state
│   │                      # (Header, Sidebar, AdminSidebar, PostCard, PostList,
│   │                      #  NotificationPanel, GlobalPopup, ExpiredDialog, CreatePostForm...)
│   ├── templates/         # tổ hợp layout lớn ở cấp trang
│   ├── Providers.tsx      # cây provider toàn cục (QueryClient, Theme, GoogleOAuth, Toaster)
│   └── ThemeProvider.tsx  # context theme sáng/tối, dựa trên themeStore
├── hooks/
│   ├── queries/           # hook useQuery/useInfiniteQuery của React Query
│   └── mutations/         # hook useMutation của React Query
├── lib/
│   ├── api/               # axios instance + các module API theo domain
│   │   ├── axiosInstance.ts   # axios instance duy nhất, gắn token + tự refresh khi 401
│   │   ├── apiService.ts      # helper apiGet/apiPost/apiPut/apiPatch/apiDelete (không throw)
│   │   ├── tokenManager.ts    # refreshToken() — gọi endpoint refresh, cập nhật cookie
│   │   └── <domain>/*Api.ts   # admin/, auth/, messages/, notifications/, posts/, user/
│   ├── queryClient.ts      # getQueryClient() — factory singleton/per-request + default options
│   ├── queryKeys.ts        # nơi tập trung toàn bộ query key của React Query
│   └── utils.ts            # cn() — helper ghép class (clsx + tailwind-merge)
├── store/                 # Zustand store, mỗi store phụ trách một mối quan tâm riêng
│   │                       # (mỗi store export cả hook và một reference thuần)
│   ├── ownerAccountStore.ts      # user đang đăng nhập (set từ JWT + gọi API profile)
│   ├── adminStore.ts             # profile admin đang đăng nhập
│   ├── notificationStore.ts      # thông báo + kết nối WebSocket (STOMP)
│   ├── messageStore.ts           # cuộc trò chuyện/tin nhắn + kết nối WebSocket (STOMP)
│   ├── themeStore.ts             # theme sáng/tối, lưu vào localStorage
│   ├── validRefreshTokenStore.ts # theo dõi refresh-token còn hợp lệ (điều khiển ExpiredDialog)
│   └── popupStore.ts             # state popup/dialog toàn cục
├── config/                # cấu hình tĩnh, không nhạy cảm
│   ├── routes.ts                 # map/hàm tạo route có type — dùng thay cho hardcode string
│   ├── adminNavRoute.tsx          # định nghĩa menu sidebar admin
│   ├── settingNavRoute.tsx        # định nghĩa menu trang setting
│   ├── userProfileOptions.tsx     # các option trong menu dropdown profile
│   ├── globalVariables.ts         # hằng số dùng chung toàn app
│   └── regex.ts                   # các regex dùng chung (validate, v.v.)
├── types/                 # type domain dùng chung — post.ts, user.ts, message.ts, api.ts,
│   └── enums/                     # attachments.ts, và các enum toàn cục
├── utils/                 # hàm helper thuần nhỏ (cookie, format ngày giờ,
│                          # chuẩn hóa tiếng Việt, xử lý media, v.v.)
└── styles/
    ├── globals.css         # entry Tailwind v4 + định nghĩa biến CSS theme
    ├── modules/            # các *.module.scss cho style theo component
    └── nav.module.scss

public/
├── decor/                 # SVG trang trí dùng ở màn hình auth/onboarding
├── logo/                  # asset logo thương hiệu
└── temp/                  # ảnh/avatar placeholder dùng tạm trong quá trình dev
```

Nguyên tắc đặt code theo từng folder:
- **`app/`** phải luôn mỏng — page chỉ render một feature component, không chứa business logic.
- **`features/`** là nơi chứa UI và logic riêng của từng tính năng; nếu một phần UI/logic được dùng lại ở nhiều feature, hãy chuyển nó lên `components/`.
- **`components/`** chỉ chứa UI tái sử dụng, không gắn với feature cụ thể (atoms → molecules → organisms → templates, độ phức tạp tổ hợp tăng dần).
- **`lib/api/`** là nơi duy nhất được gọi trực tiếp `axios`/instance `API` — feature và component chỉ gọi các hàm export từ đây, không gọi axios trực tiếp.
- **`store/`** dùng cho state toàn cục/dùng chung giữa nhiều component; state cục bộ của riêng một component nên giữ ở trong component đó.

## Các lệnh thường dùng

```bash
pnpm dev          # chạy dev server (turbopack), cổng mặc định 3002 theo NEXT_PUBLIC_APP_URL
pnpm build        # build production
pnpm start         # chạy bản build production
pnpm lint          # biome lint ./src
pnpm lint:fix      # biome lint --write ./src
pnpm format        # biome format --write ./src
pnpm check         # biome check --write ./src (lint + format)
pnpm type-check    # tsc --noEmit
pnpm analyze       # ANALYZE=true next build (phân tích bundle size)
```

Repo hiện chưa cấu hình test runner (không có script test, không có dependency framework test nào).

Biome là linter/formatter (không dùng ESLint/Prettier), config tại `biome.json`. Pre-commit hook chạy `lint-staged` qua Husky (`.husky/pre-commit`): chạy `biome check --write` trên các file `.ts/.tsx` đã stage, và `biome format --write` trên `.json/.css/.md`. Commit message được kiểm tra bởi commitlint (`commitlint.config.js`, theo chuẩn conventional commits) qua `.husky/commit-msg`.

## Kiến trúc tổng thể

### Luồng request / xác thực (auth)

- `src/proxy.ts` là Next 16 Proxy (đặt ở root, thay cho `middleware.ts` cũ). Nó đọc cookie `access-token`/`refresh-token`, decode JWT (`jwt-decode`) để lấy `scope` (role), và redirect dựa trên ba nhóm path: `GUEST_ONLY_PATHS` (login/signup/forgot-password), `ADMIN_PREFIX` (`/admin`), và `USER_PATHS`. Người dùng chưa đăng nhập truy cập path được bảo vệ sẽ bị redirect về `/login`; admin không vào được path của user và ngược lại.
- Mọi API call đều đi qua một axios instance duy nhất: `src/lib/api/axiosInstance.ts`. Nó tự gắn `Authorization: Bearer <access-token>` từ cookie cho mọi request trừ `PUBLIC_ENDPOINTS`, và khi gặp lỗi 401 sẽ tự động refresh token (`/post/auth/refresh-token`) với hàng đợi request trong lúc refresh đang chạy, sau đó retry lại request gốc một lần; nếu refresh thất bại sẽ dispatch event `auth:expired` trên `window` (được `ExpiredDialog` lắng nghe).
- `src/lib/api/apiService.ts` bọc axios instance bằng các helper `apiGet/apiPost/apiPut/apiPatch/apiDelete`. Các helper này **không bao giờ throw** — khi lỗi sẽ trả về `error.response.data` hoặc giá trị `fallback` do người gọi truyền vào (hoặc `null`). Khi gọi các hàm này, hãy coi giá trị trả về `null`/falsy là trường hợp lỗi, thay vì dùng try/catch.
- Các module API theo domain nằm ở `src/lib/api/<domain>/*Api.ts` (ví dụ `posts/postsApi.ts`, `auth/loginApi.ts`, `admin/adminProfileApi.ts`) — là các hàm mỏng gọi `apiGet/apiPost/...` với một path cụ thể và trả về data.

#### Ví dụ: tạo một service GET API mới

Giả sử cần thêm API lấy danh sách bookmark của user, tạo file `src/lib/api/posts/bookmarkApi.ts`:

```ts
import { apiGet } from "../apiService";

export const getBookmarks = async (userId: string, page = 0): Promise<unknown> => {
  return apiGet(`/post/bookmark?userId=${userId}&page=${page}`);
};
```

#### Ví dụ: tạo một service POST API mới

Thêm vào cùng file (hoặc file domain phù hợp) một hàm POST:

```ts
import { apiPost } from "../apiService";

export const addBookmark = async (postId: string): Promise<unknown> => {
  return apiPost("/post/bookmark", { postId });
};
```

Quy tắc khi viết service API:
- Luôn import helper từ `../apiService` (hoặc `@/lib/api/apiService`), không import `axios`/`API` trực tiếp.
- Trả kiểu `Promise<unknown>` (hoặc kiểu domain cụ thể từ `src/types/` nếu đã có) — không tự `try/catch` trong service, để `apiService` xử lý lỗi.
- Đặt file theo domain trong `src/lib/api/<domain>/`, đặt tên hàm theo verb + danh từ (`getX`, `createX`, `updateX`, `deleteX`).

### Route groups (`src/app`)

Ba route group song song, mỗi group có layout và quy tắc truy cập riêng do `proxy.ts` thực thi:
- `(auth)` — login/signup/forgot-password, layout một cột căn giữa, chỉ dành cho guest.
- `(user)` — app chính (`/home`, `/follow`, `/message`, `/post/[id]`, `/profile`, `/search`, `/setting`). Layout (`src/app/(user)/layout.tsx`) là client component, khi mount sẽ decode cookie access-token, set profile vào `ownerAccountStore`, mở kết nối WebSocket cho notification/message, và render `Sidebar` + `Header` + `GlobalPopup` + `ExpiredDialog` (hiện khi không còn refresh-token hợp lệ) bao quanh `{children}`. `NotificationPanel` được lazy-load qua `next/dynamic` với `ssr: false`.
- `(admin)` — trang quản trị (`/admin/*`), có `AdminLayout` + `AdminSidebar` riêng, load profile admin vào `adminStore`.

Các page trong các group này thường mỏng — chỉ render một feature component từ `src/features/<name>`.

### Tổ chức theo feature (`src/features`)

`src/features/<feature>/` (admin, auth, follow, home, message, post, profile, search, setting) là đơn vị triển khai tính năng. Quy ước:
- `index.ts` re-export component public, ví dụ `export { PostFeature } from "./components/PostFeature";`.
- `components/<ComponentName>/<ComponentName>.tsx` + `index.ts` (barrel) — mỗi component/modal có folder riêng.
- Feature component là client component (`"use client"`) tự quản lý state/effect cục bộ và gọi trực tiếp hàm từ `src/lib/api/...` (một số feature dùng `useState`/`useEffect` thuần, số khác dùng hook React Query ở `src/hooks/queries|mutations` — kiểm tra các component cùng feature để theo đúng pattern đang dùng).

#### Ví dụ: thêm một feature mới

Giả sử thêm feature "bookmark" (trang danh sách bài đã lưu):

1. Tạo `src/features/bookmark/components/BookmarkFeature/BookmarkFeature.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { getBookmarks } from "@/lib/api/posts/bookmarkApi";

export function BookmarkFeature() {
  const user = ownerAccountStore((state) => state.user);
  const [bookmarks, setBookmarks] = useState<unknown[]>([]);

  useEffect(() => {
    if (!user?.userId) return;
    getBookmarks(user.userId).then((resp) => {
      const data = (resp as { data?: unknown[] })?.data ?? [];
      setBookmarks(data);
    });
  }, [user?.userId]);

  return (
    <div className="bg-background flex flex-grow transition">
      {/* render danh sách bookmarks */}
    </div>
  );
}
```

2. Tạo barrel `src/features/bookmark/components/BookmarkFeature/index.ts`:

```ts
export { BookmarkFeature } from "./BookmarkFeature";
```

3. Tạo barrel của feature `src/features/bookmark/index.ts`:

```ts
export { BookmarkFeature } from "./components/BookmarkFeature";
```

4. Render từ page tương ứng, ví dụ `src/app/(user)/bookmark/page.tsx`:

```tsx
import { BookmarkFeature } from "@/features/bookmark";

export default function BookmarkPage() {
  return <BookmarkFeature />;
}
```

### Phân lớp component (`src/components`)

Phân lớp theo kiểu atomic design, dựa trên shadcn/ui (`components.json`: style `new-york`, base color `zinc`, có RSC+TS):
- `atoms/` — primitive của shadcn (button, dialog, card, calendar, v.v.) cùng vài atom tự viết (`Icon`, `JumpingInput`). Được alias là cả `@/components` và `ui` trong `components.json` — component shadcn mới cài qua CLI sẽ nằm ở đây.
- `molecules/` — tổ hợp nhỏ (`SearchBar`, `DataTable`, `MediaGrid`, `TabPanel`, `ButtonGroup`, `OtpInputGroup`), mỗi cái một folder riêng với barrel `index.ts`.
- `organisms/` — UI tổ hợp riêng cho app, gắn với layout/global state (`Header`, `Sidebar`/`AdminSidebar`, `PostCard`, `PostList`, `NotificationPanel`, `GlobalPopup`, `ExpiredDialog`, `CreatePostForm`, `ChangePasswordModal`, `NavMoreMenu`).
- `templates/` — tổ hợp layout lớn ở cấp trang.
- `Providers.tsx` — cây provider client toàn cục, mount trong `layout.tsx` gốc: `QueryClientProvider` → `ThemeProvider` → `GoogleOAuthProvider` → `{children}` + `Toaster` (sonner), `ReactQueryDevtools` chỉ mount ở môi trường development.

Dùng `cn()` từ `src/lib/utils.ts` (clsx + tailwind-merge) để ghép class điều kiện, theo đúng quy ước của shadcn.

### Quản lý state

- **Zustand** cho state toàn cục/client, mỗi mối quan tâm một store trong `src/store/`: `ownerAccountStore` (user đang đăng nhập), `adminStore`, `notificationStore`/`messageStore` (tự quản lý kết nối WebSocket qua `@stomp/stompjs`), `themeStore` (lưu vào localStorage qua middleware `persist` của zustand, tránh lỗi hydration bằng cách dùng storage no-op khi `window` chưa tồn tại), `validRefreshTokenStore`, `popupStore`. Các store thường export cả một hook (`useXStore`) và một reference thuần (`xStore`) để dùng ngoài React (ví dụ trong axios interceptor/module API).

  Ví dụ tạo store mới (theo mẫu `themeStore.ts`):

  ```ts
  import { create } from "zustand";

  interface BookmarkStore {
    bookmarkIds: string[];
    addBookmark: (id: string) => void;
  }

  export const useBookmarkStore = create<BookmarkStore>()((set) => ({
    bookmarkIds: [],
    addBookmark: (id) =>
      set((state) => ({ bookmarkIds: [...state.bookmarkIds, id] })),
  }));

  export const bookmarkStore = useBookmarkStore;
  ```

- **TanStack React Query** cho server state. `src/lib/queryClient.ts` export `getQueryClient()` (singleton ở client, instance mới cho mỗi request ở server — pattern chuẩn của Next App Router) với default `staleTime: 5 phút`, `gcTime: 10 phút`, `retry: 2`, `refetchOnWindowFocus: false`. `src/lib/queryKeys.ts` tập trung toàn bộ query key theo domain (`posts`, `profile`, `notifications`, `messages`, `search`, `admin`) — khi thêm key mới hãy thêm vào đây thay vì viết mảng key trực tiếp trong component. Hook query/mutation nằm ở `src/hooks/queries/` và `src/hooks/mutations/`.

  Ví dụ thêm query key và hook `useQuery` mới (lấy theo mẫu `usePosts.ts`):

  ```ts
  // src/lib/queryKeys.ts — thêm key vào nhóm domain phù hợp
  bookmarks: {
    list: (userId: string) => ["bookmarks", userId] as const,
  },
  ```

  ```ts
  // src/hooks/queries/useBookmarks.ts
  "use client";
  import { useQuery } from "@tanstack/react-query";
  import { queryKeys } from "@/lib/queryKeys";
  import { getBookmarks } from "@/lib/api/posts/bookmarkApi";

  export function useBookmarks(userId: string) {
    return useQuery({
      queryKey: queryKeys.bookmarks.list(userId),
      queryFn: () => getBookmarks(userId),
      enabled: !!userId,
    });
  }
  ```

  Ví dụ thêm hook `useMutation` mới (lấy theo mẫu `usePostMutations.ts`):

  ```ts
  // src/hooks/mutations/useBookmarkMutations.ts
  "use client";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { toast } from "sonner";
  import { queryKeys } from "@/lib/queryKeys";
  import { addBookmark } from "@/lib/api/posts/bookmarkApi";

  export function useAddBookmark(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: addBookmark,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.list(userId) });
        toast.success("Đã lưu bài viết");
      },
      onError: () => toast.error("Lưu bài viết thất bại"),
    });
  }
  ```

### Config & utilities

- `src/config/` — config tĩnh: `routes.ts` (map/hàm tạo route có type, ví dụ `ROUTES.POST(postId)`, `ROUTES.PROFILE(userId)` — dùng thay cho hardcode path string), `adminNavRoute.tsx`/`settingNavRoute.tsx` (định nghĩa menu), `globalVariables.ts`, `regex.ts`.
- `src/utils/` — helper thuần nhỏ (lấy/set cookie, format ngày giờ, chuẩn hóa tiếng Việt, xử lý media, v.v.) — kiểm tra ở đây trước khi viết helper mới.
- `src/types/` — type domain dùng chung (`post.ts`, `user.ts`, `message.ts`, `api.ts`, `attachments.ts`, `enums/`).
- Biến môi trường đều là `NEXT_PUBLIC_*` (xem `.env.example`): URL/tên app, protocol/domain/version của API (ghép thành baseURL của axios), protocol/host của WebSocket, Google OAuth client ID.

### Styling

Tailwind CSS v4 (`@tailwindcss/postcss`), style toàn cục ở `src/styles/globals.css`, theme dùng biến CSS (sáng/tối, đổi qua `themeStore`/`ThemeProvider`) — một số nơi dùng trực tiếp giá trị màu như `var(--lower-background-clr)` xen lẫn class Tailwind. Sass dùng cho style theo module (`src/styles/nav.module.scss`, `*.module.scss`). SVG được import như React component qua `@svgr/webpack` (cấu hình trong `next.config.ts` phần turbopack rules).
