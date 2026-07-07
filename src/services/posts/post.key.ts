export const postKeys = {
  all: ["posts"] as const,
  home: () => ["posts", "home"] as const,
  follow: () => ["posts", "follow"] as const,
  detail: (id: string) => ["posts", "detail", id] as const,
  profile: (userId: string) => ["posts", "profile", userId] as const,
  search: (keyword: string) => ["posts", "search", keyword] as const,
  comments: {
    all: ["posts", "comments"] as const,
    list: (postId: string) => ["posts", "comments", "list", postId] as const,
    replies: (commentId: string) => ["posts", "comments", "replies", commentId] as const,
    repliesAll: () => ["posts", "comments", "replies"] as const,
  },
} as const;
