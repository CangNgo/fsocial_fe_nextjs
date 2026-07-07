"use client";

import { useMutation } from "@tanstack/react-query";
import { complaint } from "@/services/post/complaint-api";

export function useCreateReport() {
  return useMutation({
    mutationFn: complaint,
  });
}
