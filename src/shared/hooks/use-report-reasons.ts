"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { getTermOfService } from "@/services/admin/admin-policy-setting-api";

export function useReportReasons() {
  const query = useQuery({
    queryKey: adminKeys.termsOfService,
    queryFn: getTermOfService,
    select: (resp) =>
      resp?.statusCode === 200 ? (resp.data ?? []).filter((term) => term.status) : [],
  });

  return {
    reportOptions: query.data ?? [],
  };
}
