export const postKeys = {
  comments: {
    all: ["posts", "comments"] as const,
    list: (postId: string) => ["posts", "comments", "list", postId] as const,
    replies: (commentId: string) => ["posts", "comments", "replies", commentId] as const,
    repliesAll: () => ["posts", "comments", "replies"] as const,
  },
} as const;
