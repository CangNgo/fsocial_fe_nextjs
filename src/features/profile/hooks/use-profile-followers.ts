"use client";

import { useCallback, useEffect, useState } from "react";
import { getFollowers } from "../api/profile-api";
import type { ProfileFollower, ProfileFollowersResponse } from "../types/profile-tabs";

const FOLLOWERS_TAB_INDEX = 3;

export function useProfileFollowers(currentTab: number | null) {
  const [followers, setFollowers] = useState<ProfileFollower[] | null>(null);

  const showFollowers = useCallback(async () => {
    if (followers) return;
    const resp = (await getFollowers()) as ProfileFollowersResponse | null;
    if (!resp || resp.statusCode !== 200) return;
    setFollowers(resp.data ?? []);
  }, [followers]);

  useEffect(() => {
    if (currentTab === FOLLOWERS_TAB_INDEX) {
      showFollowers();
    }
  }, [currentTab, showFollowers]);

  return { followers };
}
