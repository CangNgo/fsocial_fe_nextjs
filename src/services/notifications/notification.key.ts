export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string) => ["notifications", "list", userId] as const,
} as const;
