export const profileKeys = {
  all: ["profile"] as const,
  owner: () => ["profile", "owner"] as const,
  detail: (userId: string) => ["profile", "detail", userId] as const,
  followers: (userId: string) => ["profile", "followers", userId] as const,
  following: (userId: string) => ["profile", "following", userId] as const,
  attachments: (userId: string) => ["profile", "attachments", userId] as const,
} as const;
