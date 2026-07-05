"use client";

import { getPosts } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { PostResponse } from "@/shared/types/post";
import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTimelineStore } from "../stores/timeline-store";
import { selectTimelineState } from "../types/post";

export function useTimeline() {
  const {
    posts,
    hasMore,
    prependPost,
    appendPosts,
    setHasMore,
    setIsFetching,
    incrementPage,
    reset,
  } = useTimelineStore(useShallow(selectTimelineState));
  const user = ownerAccountStore((state) => state.user);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset must rerun when the user changes
  useEffect(() => {
    reset();
  }, [user.id, reset]);

  const fetchPosts = useCallback(async () => {
    const { isFetching: fetching, hasMore: more, page: currentPage } = useTimelineStore.getState();

    if (fetching || !more || !user.id) return;

    setIsFetching(true);
    const response = await getPosts(user.id, currentPage);
    setIsFetching(false);

    if (response?.statusCode !== 200) {
      setHasMore(false);
      return;
    }

    //PostResponse[]
    const postResponse = response?.data ? response.data : [];

    if (postResponse.length === 0) {
      setHasMore(false);
      return;
    } else {
      appendPosts(postResponse);
      incrementPage();
    }
  }, [user.id, appendPosts, incrementPage, setHasMore, setIsFetching]);

  useEffect(() => {
    if (!user.id) return;
    const { posts: currentPosts, page: currentPage } = useTimelineStore.getState();
    if (currentPosts !== null || currentPage !== 0) return;

    fetchPosts();
  }, [fetchPosts, user.id]);

  const handlePostCreated = useCallback(
    (post: Record<string, unknown>) => {
      const normalizedPost = post as unknown as PostResponse;
      prependPost({
        ...normalizedPost,
        displayName: normalizedPost.displayName ?? user?.displayName ?? "",
        avatar: normalizedPost.avatar ?? user?.avatar ?? null,
      });
    },
    [prependPost, user?.avatar, user?.displayName],
  );

  return { posts, hasMore, fetchPosts, handlePostCreated };
}
