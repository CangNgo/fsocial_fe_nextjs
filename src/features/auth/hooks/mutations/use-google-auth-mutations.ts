"use client";

import { useMutation } from "@tanstack/react-query";
import { getUserInfoByGoogle } from "@/services/auth/google-api";

export function useGoogleLoginMutation() {
  return useMutation({ mutationFn: getUserInfoByGoogle });
}
