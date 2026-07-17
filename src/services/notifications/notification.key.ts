export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string) => ["notifications", "list", userId] as const,
  unRead: ['un-read']
} as const;
