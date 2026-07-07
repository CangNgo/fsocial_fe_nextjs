"use client";

import { useMutation } from "@tanstack/react-query";
import { requestOTP, resetPassword, validOTP } from "@/services/auth/forgot-password-api";

export function useRequestOtpMutation() {
  return useMutation({ mutationFn: requestOTP });
}

export function useValidOtpMutation() {
  return useMutation({ mutationFn: validOTP });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: resetPassword });
}
