"use client";

import { useMutation } from "@tanstack/react-query";
import {
  checkDuplicate,
  requestOTP,
  sendingCreateAccount,
  validOTP,
} from "@/services/auth/signup-api";

export function useCheckDuplicateMutation() {
  return useMutation({ mutationFn: checkDuplicate });
}

export function useSignupRequestOtpMutation() {
  return useMutation({ mutationFn: requestOTP });
}

export function useSignupValidOtpMutation() {
  return useMutation({ mutationFn: validOTP });
}

export function useCreateAccountMutation() {
  return useMutation({ mutationFn: sendingCreateAccount });
}
