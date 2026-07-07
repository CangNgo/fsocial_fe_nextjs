export const adminKeys = {
  users: ["admin", "users"] as const,
  complaints: ["admin", "complaints"] as const,
  policies: ["admin", "policies"] as const,
  termsOfService: ["admin", "terms-of-service"] as const,
  reports: {
    all: ["admin", "reports"] as const,
  },
} as const;
