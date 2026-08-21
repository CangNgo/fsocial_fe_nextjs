import type { FaqType } from "@/shared/types/faq";

export const adminKeys = {
  users: ["admin", "users"] as const,
  complaints: ["admin", "complaints"] as const,
  policies: ["admin", "policies"] as const,
  termsOfService: ["admin", "terms-of-service"] as const,
  faqs: {
    all: ["admin", "faqs"] as const,
    byType: (type: FaqType) => ["admin", "faqs", type] as const,
    detail: (faqId: string) => ["admin", "faqs", "detail", faqId] as const,
  },
  reports: {
    all: ["admin", "reports"] as const,
  },
} as const;
