export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    home: () => ["posts", "home"] as const,
    follow: () => ["posts", "follow"] as const,
    detail: (id: string) => ["posts", "detail", id] as const,
    profile: (userId: string) => ["posts", "profile", userId] as const,
    search: (keyword: string) => ["posts", "search", keyword] as const,
  },
  profile: {
    owner: (userId: string) => ["profile", "owner", userId] as const,
    user: (userId: string) => ["profile", "user", userId] as const,
    followers: (userId: string) => ["profile", "followers", userId] as const,
    following: (userId: string) => ["profile", "following", userId] as const,
  },
  notifications: {
    list: (userId: string) => ["notifications", userId] as const,
  },
  messages: {
    conversations: (userId: string) => ["messages", "conversations", userId] as const,
    thread: (convId: string) => ["messages", "thread", convId] as const,
  },
  search: {
    users: (q: string) => ["search", "users", q] as const,
    posts: (q: string) => ["search", "posts", q] as const,
  },
  admin: {
    users: (params: Record<string, unknown>) => ["admin", "users", params] as const,
    complaints: () => ["admin", "complaints"] as const,
    policies: () => ["admin", "policies"] as const,
    reports: {
      all: ["admin", "reports"] as const,
    },
  },
} as const;
