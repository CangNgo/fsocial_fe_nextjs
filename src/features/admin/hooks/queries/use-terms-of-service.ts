"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { getTermOfService } from "@/services/admin/admin-policy-setting-api";

export function useTermsOfService() {
  const query = useQuery({
    queryKey: adminKeys.termsOfService,
    queryFn: getTermOfService,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  return {
    policies: query.data ?? [],
    loading: query.isLoading,
  };
}
