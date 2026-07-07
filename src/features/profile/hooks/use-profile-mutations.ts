"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "@/services/profile/profile.key";
import { requestFollow, unfollow } from "@/services/profile/profile-api";

export function useRequestFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestFollow,
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollow,
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}
