# Cấu trúc thư mục Next.js hiện đại cho dự án lớn

### (App Router + Zustand + TanStack Query + Axios + shadcn/ui + Zod + Tailwind)

---

## 1. Ba nguyên tắc cốt lõi

Trước khi xem cây thư mục, cần hiểu **tại sao** người ta tổ chức như vậy — nếu không, bạn sẽ chỉ copy cấu trúc mà không biết khi nào nên phá vỡ nó.

1. **Feature-based, không phải type-based.** Thay vì có 1 thư mục `components/` khổng lồ chứa tất cả component của mọi tính năng, mỗi _feature_ (auth, products, orders...) là một module độc lập, chứa component/hook/store/api riêng của nó. Khi cần sửa tính năng "giỏ hàng", bạn chỉ mở 1 folder thay vì lục tung 5 folder khác nhau.
2. **Colocation — đặt code gần nơi nó được dùng.** Cái gì chỉ dùng ở 1 route thì nằm trong route đó (dùng folder `_components` riêng của route). Cái gì dùng ở nhiều nơi mới đẩy lên `shared/` hoặc `components/` chung.
3. **Dependency direction rõ ràng — luồng phụ thuộc một chiều.**
   `components → hooks → services/api → types`
   Không bao giờ để `lib/` import ngược lại từ `features/`. Vi phạm nguyên tắc này là nguồn gốc chính của "spaghetti code" khi dự án lớn dần.

Next.js App Router hỗ trợ 2 quy ước quan trọng giúp áp dụng nguyên tắc trên mà **không** làm rối route:

- `(group-name)` — route group: gom route lại, chia sẻ layout, nhưng **không** xuất hiện trong URL.
- `_folder-name` — private folder: Next.js bỏ qua, không coi là route → dùng để colocate component/hook riêng của 1 route.

---

## 2. Cây thư mục tổng quan

```
my-app/
├── src/
│   ├── app/                      # CHỈ chứa routing (page/layout/loading/error)
│   │   ├── (marketing)/          # route group: landing page, pricing...
│   │   │   ├── page.tsx
│   │   │   └── pricing/page.tsx
│   │   ├── (auth)/               # route group: login, register
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/          # route group: app đã đăng nhập
│   │   │   ├── layout.tsx
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── _components/  # component CHỈ dùng ở route này
│   │   │   │       └── product-filter-bar.tsx
│   │   │   └── orders/page.tsx
│   │   ├── api/                  # route handlers (nếu cần BFF/webhook)
│   │   ├── layout.tsx            # root layout
│   │   └── error.tsx
│   │
│   ├── features/                 # ⭐ TRÁI TIM của cấu trúc — mỗi feature 1 module
│   │   ├── auth/
│   │   │   ├── components/       # UI riêng của feature (LoginForm, OtpInput...)
│   │   │   ├── hooks/            # useLogin, useSession...
│   │   │   ├── api/              # axios calls: login(), refreshToken()
│   │   │   ├── store/            # zustand store riêng feature (nếu cần)
│   │   │   ├── schemas/          # zod schema: loginSchema, registerSchema
│   │   │   ├── types.ts
│   │   │   └── index.ts          # barrel export — public API của feature
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   ├── store/
│   │   │   ├── schemas/
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── orders/
│   │       └── ... (tương tự)
│   │
│   ├── components/                # Component DÙNG CHUNG toàn app
│   │   ├── ui/                    # shadcn/ui generate vào đây (button, dialog...)
│   │   ├── layout/                # Header, Sidebar, Footer
│   │   └── common/                # EmptyState, ErrorBoundary, PageHeader...
│   │
│   ├── hooks/                     # Hook dùng chung, KHÔNG thuộc feature nào
│   │   ├── use-debounce.ts
│   │   ├── use-media-query.ts
│   │   └── use-disclosure.ts
│   │
│   ├── stores/                    # Zustand store TOÀN CỤC (không thuộc 1 feature)
│   │   ├── use-ui-store.ts        # sidebar open/close, theme...
│   │   └── use-auth-store.ts      # user hiện tại, token (nếu cần global)
│   │
│   ├── lib/                       # Cấu hình & tiện ích cấp thấp
│   │   ├── axios.ts               # instance axios + interceptor
│   │   ├── query-client.ts        # QueryClient config cho TanStack Query
│   │   ├── utils.ts               # cn(), formatCurrency()... (shadcn dùng utils.ts)
│   │   └── constants.ts
│   │
│   ├── providers/                 # Gom các Context/Provider của app
│   │   ├── query-provider.tsx     # bọc QueryClientProvider
│   │   ├── theme-provider.tsx
│   │   └── app-providers.tsx      # tổng hợp tất cả provider, import 1 lần ở layout
│   │
│   ├── types/                     # Type dùng chung toàn app (API response chung...)
│   │   ├── api.ts                 # ApiResponse<T>, PaginatedResponse<T>
│   │   └── index.ts
│   │
│   └── config/
│       ├── env.ts                 # đọc & validate biến môi trường bằng zod
│       └── site.ts                # metadata, site name, nav links...
│
├── public/
├── .env.local
├── components.json                 # config shadcn/ui
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

> **Lưu ý:** dùng `src/` làm root cho code là khuyến nghị phổ biến — tách biệt code khỏi file cấu hình ở ngoài cùng, và cho phép alias `@/*` trỏ thẳng vào `src/*`.

---

## 3. Bóc tách chi tiết 1 feature — ví dụ `features/products`

Đây là phần quan trọng nhất vì nó thể hiện cách các thư viện bạn dùng "sống chung" với nhau trong 1 module.

```
features/products/
├── api/
│   ├── product.api.ts        # các hàm gọi axios: getProducts(), getProductById()
│   └── product.keys.ts       # query key factory cho TanStack Query
├── hooks/
│   ├── use-products.ts       # useQuery(getProducts)
│   ├── use-product.ts        # useQuery(getProductById)
│   └── use-create-product.ts # useMutation(createProduct)
├── components/
│   ├── product-card.tsx
│   ├── product-list.tsx
│   └── product-form.tsx      # dùng react-hook-form + zodResolver(productSchema)
├── store/
│   └── use-product-filter-store.ts  # zustand — state UI cục bộ (filter, view mode)
├── schemas/
│   └── product.schema.ts     # zod: productSchema, dùng chung cho form + validate API
├── types.ts                  # Product, ProductFilter... (infer từ zod schema)
└── index.ts                  # export những gì feature khác được phép dùng
```

**Ví dụ nội dung từng file để thấy rõ luồng dữ liệu:**

```ts
// schemas/product.schema.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Tên bắt buộc"),
  price: z.coerce.number().positive(),
  categoryId: z.string(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
```

```ts
// api/product.keys.ts — query key factory, tránh hard-code string rải rác
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: unknown) => [...productKeys.lists(), filters] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
};
```

```ts
// api/product.api.ts
import { axiosClient } from "@/lib/axios";
import type { Product } from "../types";

export const productApi = {
  getAll: (params?: Record<string, string>) =>
    axiosClient.get<Product[]>("/products", { params }).then((r) => r.data),
  getById: (id: string) => axiosClient.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (payload: ProductFormValues) =>
    axiosClient.post<Product>("/products", payload).then((r) => r.data),
};
```

```ts
// hooks/use-products.ts
import { useQuery } from "@tanstack/react-query";
import { productApi } from "../api/product.api";
import { productKeys } from "../api/product.keys";

export function useProducts(filters?: Record<string, string>) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.getAll(filters),
  });
}
```

```ts
// store/use-product-filter-store.ts — zustand chỉ giữ UI state, KHÔNG giữ server data
import { create } from "zustand";

interface ProductFilterState {
  keyword: string;
  view: "grid" | "list";
  setKeyword: (k: string) => void;
  toggleView: () => void;
}

export const useProductFilterStore = create<ProductFilterState>((set) => ({
  keyword: "",
  view: "grid",
  setKeyword: (keyword) => set({ keyword }),
  toggleView: () => set((s) => ({ view: s.view === "grid" ? "list" : "grid" })),
}));
```

**Quy tắc phân chia state quan trọng nhất khi dùng cả Zustand lẫn TanStack Query:**

| Loại state                               | Dùng gì                              | Ví dụ                                    |
| ---------------------------------------- | ------------------------------------ | ---------------------------------------- |
| Server state (dữ liệu từ API)            | **TanStack Query**                   | danh sách sản phẩm, thông tin user       |
| UI/client state (không liên quan server) | **Zustand**                          | sidebar mở/đóng, filter đang chọn, theme |
| Form state                               | **react-hook-form** (+ zod resolver) | dữ liệu đang nhập trong form             |

Đây là lỗi phổ biến nhất ở người mới: nhét dữ liệu server (ví dụ danh sách sản phẩm) vào Zustand rồi tự fetch/set thủ công — mất hết cache, retry, stale-time mà TanStack Query cho miễn phí. **Zustand chỉ nên giữ state mà server không biết tới.**

---

## 4. `index.ts` (barrel export) — ranh giới public API của feature

```ts
// features/products/index.ts
export { ProductList } from "./components/product-list";
export { ProductForm } from "./components/product-form";
export { useProducts } from "./hooks/use-products";
export type { Product } from "./types";
// KHÔNG export product.api.ts trực tiếp ra ngoài — feature khác chỉ được
// dùng qua hook, không được gọi thẳng axios của feature khác.
```

Nhờ vậy, `app/(dashboard)/products/page.tsx` chỉ cần:

```ts
import { ProductList, useProducts } from "@/features/products";
```

— không cần biết bên trong `products/` tổ chức thế nào. Đây chính là lợi ích lớn nhất: **thay đổi nội bộ 1 feature không ảnh hưởng chỗ khác.**

---

## 5. Cấu hình dùng chung quan trọng

```ts
// lib/axios.ts
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10_000,
});

axiosClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);
```

```ts
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60 * 1000, retry: 1 },
    },
  });
}
```

---

## 6. Quy ước đặt tên & import alias

- **File:** `kebab-case.ts` (`product-card.tsx`, `use-products.ts`) — đồng nhất với chuẩn của shadcn/ui, dễ đọc trên mọi hệ điều hành.
- **Component/type:** `PascalCase` (`ProductCard`, `Product`).
- **Hook:** luôn bắt đầu `use-` và export `useXxx`.
- **Alias trong `tsconfig.json`:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/components/*": ["./src/components/*"]
    }
  }
}
```

---

## 7. Khi nào tách thêm, khi nào KHÔNG cần

- Dự án < 5 tính năng, team 1-2 người → chưa cần `features/`, cứ để `components/`, `hooks/` phẳng, tách sớm quá sẽ over-engineering.
- Bắt đầu thấy 1 folder `components/` có > 15-20 file không liên quan nhau → đó là tín hiệu nên chuyển sang feature-based.
- Nhiều app dùng chung code (ví dụ thêm app mobile/admin riêng) → cân nhắc lên **monorepo** (Turborepo) với `apps/web`, `apps/admin`, `packages/ui`, `packages/api-client` — đây là bước tiếp theo sau feature-based, không phải bước đầu tiên.
- Đừng tạo folder rỗng "phòng khi cần" — cấu trúc nên phản ánh sản phẩm thật, không phải best practice trên giấy.

---

## 8. Checklist khi refactor dự án hiện tại sang cấu trúc này

1. Liệt kê các "domain" nghiệp vụ thực sự (auth, products, orders...) — đây sẽ là các folder trong `features/`.
2. Với mỗi domain, gom component/hook/api đang nằm rải rác về đúng folder feature của nó.
3. Cái gì dùng ≥ 2 feature mới đẩy lên `components/`, `hooks/` chung — đừng đẩy lên chung "cho chắc".
4. Thiết lập `lib/axios.ts` và `lib/query-client.ts` một lần, dùng xuyên suốt.
5. Viết `index.ts` cho từng feature, sau đó **enforce** rule: import chéo giữa 2 feature chỉ được qua `index.ts` (có thể dùng ESLint rule `import/no-internal-modules` hoặc `eslint-plugin-boundaries` để tự động kiểm tra).
6. Refactor từng feature một, không làm toàn bộ cùng lúc — giữ app chạy được ở mỗi bước.

---

_Nguồn tham khảo cách tổ chức: mô hình feature-based/colocation phổ biến trong cộng đồng Next.js App Router hiện nay (kết hợp giữa quy ước route group/private folder chính thức của Next.js và pattern "bulletproof-react" được nhiều dự án SaaS production áp dụng)._
