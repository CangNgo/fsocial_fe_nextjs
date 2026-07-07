"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { getComplaint } from "@/services/admin/admin-complaint-api";

export function useComplaints() {
  const query = useQuery({
    queryKey: adminKeys.complaints,
    queryFn: getComplaint,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  return {
    complaints: query.data ?? [],
    loading: query.isLoading,
  };
}
