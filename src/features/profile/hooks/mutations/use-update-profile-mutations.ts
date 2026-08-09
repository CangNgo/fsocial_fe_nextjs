"use client";

import {
  updateAvatar,
  updateBanner,
  updatePersonalInfo,
} from "@/services/profile/update-profile-api";
import { useMutation } from "@tanstack/react-query";

export function useUpdatePersonalInfoMutation() {
  return useMutation({ mutationFn: updatePersonalInfo });
}

export function useUpdateAvatarMutation() {
  return useMutation({ mutationFn: updateAvatar });
}

export function useUpdateBannerMutation() {
  return useMutation({ mutationFn: updateBanner });
}
