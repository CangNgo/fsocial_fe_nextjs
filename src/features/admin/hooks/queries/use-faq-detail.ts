"use client";

import { useQuery } from "@tanstack/react-query";
import { getFaqById } from "@/services/admin/admin-faq-api";
import { adminKeys } from "@/services/admin/admin.key";

export function useFaqDetail(faqId?: string) {
  const query = useQuery({
    queryKey: faqId ? adminKeys.faqs.detail(faqId) : adminKeys.faqs.detail(""),
    queryFn: () => getFaqById(faqId ?? ""),
    enabled: Boolean(faqId),
  });
  const hasApiError = Boolean(query.data?.statusCode && query.data.statusCode >= 400);

  return {
    faq: !hasApiError ? (query.data?.data ?? null) : null,
    loading: query.isLoading,
    isError: query.isError || hasApiError,
  };
}
