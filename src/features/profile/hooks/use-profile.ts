"use client";

import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "@/services/profile/profile.key";
import { getOwnerProfile, getProfile } from "@/services/profile/profile-api";

export function useOwnerProfile(enabled = true) {
  return useQuery({
    queryKey: profileKeys.owner(),
    queryFn: getOwnerProfile,
    enabled,
  });
}

export function useProfile(userId?: string | null) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? ""),
    queryFn: () => getProfile(userId as string),
    enabled: !!userId,
  });
}
