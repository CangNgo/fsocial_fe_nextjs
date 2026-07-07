export const searchKeys = {
  all: ["search"] as const,
  users: (keyword: string) => ["search", "users", keyword] as const,
  posts: (keyword: string) => ["search", "posts", keyword] as const,
} as const;
