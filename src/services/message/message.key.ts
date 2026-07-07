export const messageKeys = {
  all: ["messages"] as const,
  conversations: (userId: string) => ["messages", "conversations", userId] as const,
  thread: (conversationId: string) => ["messages", "thread", conversationId] as const,
} as const;
