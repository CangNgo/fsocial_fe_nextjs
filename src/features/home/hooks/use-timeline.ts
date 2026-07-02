"use client";

import { useCallback, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { getPosts } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { TimelinePost } from "@/shared/types/post";
import { useTimelineStore } from "../store/timeline-store";
import { selectTimelineState } from "../types/post";
import { getUniquePosts, isPostsResponse, normalizePost } from "../utils/normalize-post";

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
    const {
      isFetching: fetching,
      hasMore: more,
      page: currentPage,
      posts: currentPosts,
    } = useTimelineStore.getState();

    if (fetching || !more || !user.id) return;

    setIsFetching(true);
    const response = await getPosts(user.id, currentPage);
    setIsFetching(false);

    if (!isPostsResponse(response) || response.statusCode !== 200) {
      setHasMore(false);
      return;
    }

    const newPosts = Array.isArray(response.data) ? response.data.map(normalizePost) : [];

    if (newPosts.length === 0) {
      setHasMore(false);
      return;
    }

    const uniquePosts = getUniquePosts(currentPosts, newPosts);
    if (uniquePosts.length > 0) {
      appendPosts(uniquePosts);
    }

    incrementPage();
  }, [user.id, appendPosts, incrementPage, setHasMore, setIsFetching]);

  useEffect(() => {
    if (!user.id) return;
    const { posts: currentPosts, page: currentPage } = useTimelineStore.getState();
    if (currentPosts !== null || currentPage !== 0) return;

    fetchPosts();
  }, [fetchPosts, user.id]);

  const handlePostCreated = useCallback(
    (post: TimelinePost) => {
      prependPost({
        ...normalizePost(post),
        displayName: post.displayName ?? user?.displayName ?? "",
        avatar: post.avatar ?? user?.avatar ?? null,
      });
    },
    [prependPost, user?.avatar, user?.displayName],
  );

  return { posts, hasMore, fetchPosts, handlePostCreated };
}
