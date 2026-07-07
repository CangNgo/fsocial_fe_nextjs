"use client";

import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth/login-api";

export function useLoginMutation() {
  return useMutation({ mutationFn: login });
}
