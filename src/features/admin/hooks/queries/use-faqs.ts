"use client";

import { useQuery } from "@tanstack/react-query";
import { getFaqsByType } from "@/services/admin/admin-faq-api";
import { adminKeys } from "@/services/admin/admin.key";
import type { FaqType } from "@/shared/types/faq";

export function useFaqsByType(type: FaqType) {
  const query = useQuery({
    queryKey: adminKeys.faqs.byType(type),
    queryFn: () => getFaqsByType(type),
  });
  const hasApiError = Boolean(query.data?.statusCode && query.data.statusCode >= 400);

  return {
    faqs: !hasApiError ? (query.data?.data ?? []) : [],
    loading: query.isLoading,
    isError: query.isError || hasApiError,
    error: query.error,
  };
}
