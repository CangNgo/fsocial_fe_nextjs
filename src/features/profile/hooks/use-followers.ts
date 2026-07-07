"use client";

import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "@/services/profile/profile.key";
import { getFollowers } from "@/services/profile/profile-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { ProfileFollower, ProfileFollowersResponse } from "../types/profile-tabs";

const FOLLOWERS_TAB_INDEX = 3;

export function useFollowers(currentTab: number | null) {
  const { user } = ownerAccountStore();

  const query = useQuery({
    queryKey: profileKeys.followers(user?.id ?? ""),
    queryFn: () => getFollowers() as Promise<ProfileFollowersResponse | null>,
    enabled: !!user?.id && currentTab === FOLLOWERS_TAB_INDEX,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  const followers: ProfileFollower[] | null = query.data ?? null;

  return { followers };
}
