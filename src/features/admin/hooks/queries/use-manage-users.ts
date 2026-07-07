"use client";

import { useQuery } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { getManageUser } from "@/services/admin/admin-manage-user-api";

export function useManageUsers() {
  const query = useQuery({
    queryKey: adminKeys.users,
    queryFn: getManageUser,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  return {
    users: query.data ?? [],
    loading: query.isLoading,
  };
}
