"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts } from "@/shared/api/posts/posts-api";
import type { ProfilePost, ProfilePostsResponse } from "../types/profile-tabs";

export function useProfilePosts(profilePostUserId?: string | null, currentTab?: number | null) {
  const [postsUser, setPostsUser] = useState<ProfilePost[] | null>(null);
  const pageRef = useRef(0);
  const isFetchingPostsRef = useRef(false);
  const hasMorePostsRef = useRef(true);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const fetchPostsUser = useCallback(async () => {
    if (isFetchingPostsRef.current || !hasMorePostsRef.current || !profilePostUserId) return;

    isFetchingPostsRef.current = true;
    const resp = (await getPosts(
      profilePostUserId,
      pageRef.current,
    )) as ProfilePostsResponse | null;
    isFetchingPostsRef.current = false;

    if (!resp || resp.statusCode !== 200) return;

    const newPosts = resp.data ?? [];

    if (newPosts.length === 0) {
      hasMorePostsRef.current = false;
      setHasMorePosts(false);
      setPostsUser((prev) => prev ?? []);
      return;
    }

    setPostsUser((prev) => {
      if (!prev) return newPosts;

      const existingIds = new Set(prev.map((post) => post?.id).filter(Boolean));
      const uniqueNewPosts = newPosts.filter((post) => !existingIds.has(post?.id));

      if (uniqueNewPosts.length === 0) return prev;
      return [...prev, ...uniqueNewPosts];
    });

    pageRef.current += 1;
  }, [profilePostUserId]);

  const resetPostsUserState = useCallback(() => {
    setPostsUser(null);
    pageRef.current = 0;
    isFetchingPostsRef.current = false;
    hasMorePostsRef.current = true;
    setHasMorePosts(true);
  }, []);

  useEffect(() => {
    resetPostsUserState();
  }, [resetPostsUserState, profilePostUserId]);

  useEffect(() => {
    if (currentTab === 0 && profilePostUserId) {
      fetchPostsUser();
    }
  }, [currentTab, profilePostUserId, fetchPostsUser]);

  return { postsUser, fetchPostsUser, hasMorePosts };
}
