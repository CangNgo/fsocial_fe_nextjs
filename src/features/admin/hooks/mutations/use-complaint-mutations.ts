"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "@/services/admin/admin.key";
import { readingComplaint } from "@/services/admin/admin-complaint-api";

export function useReadComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readingComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.complaints });
    },
  });
}
