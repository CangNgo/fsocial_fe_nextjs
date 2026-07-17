"use client";

import { complaint } from "@/services/posts/complaint-api";
import { useMutation } from "@tanstack/react-query";

export function useCreateReport() {
  return useMutation({
    mutationFn: complaint,
  });
}
