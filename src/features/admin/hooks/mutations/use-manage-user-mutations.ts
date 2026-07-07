"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { banUser } from "@/services/admin/admin-manage-user-api";

export function useBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: banUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
  });
}
