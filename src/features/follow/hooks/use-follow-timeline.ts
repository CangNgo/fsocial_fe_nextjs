"use client";

import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { getFollowingPosts } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import CreatePostForm from "@/shared/components/organisms/create-post-form";
import type { FollowPost, FollowPostsResponse } from "../types/follow";

export function useFollowTimeline() {
  const user = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();

  const [posts, setPosts] = useState<FollowPost[] | null>(null);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const handlePostCreated = useCallback((post: FollowPost) => {
    setPosts((prev) => (prev ? [post, ...prev] : [post]));
  }, []);

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const resp = (await getFollowingPosts(pageRef.current)) as FollowPostsResponse | null;
    isFetchingRef.current = false;

    if (!resp || resp.statusCode !== 200) return;
    const newPosts = resp.data ?? [];
    if (newPosts.length === 0) return;
    setPosts((prev) => (prev ? [...prev, ...newPosts] : newPosts));
    pageRef.current += 1;
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleOpenCreatePost = useCallback(() => {
    showPopup("Tạo bài viết", createElement(CreatePostForm, { onPostCreated: handlePostCreated }));
  }, [handlePostCreated, showPopup]);

  return {
    user,
    posts,
    fetchPosts,
    handleOpenCreatePost,
  };
}
