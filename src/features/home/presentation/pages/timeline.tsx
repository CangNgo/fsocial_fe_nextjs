"use client";

import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { PostList } from "@/features/post/presentation/molecules/post-list";
import CreatePostForm from "@/shared/components/organisms/create-post-form";
import { getPosts } from "@/shared/api/posts/posts-api";
import { ownerAccountStore, type User } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { getCookie } from "@/shared/utils/cookie";
import { useTimelineStore } from "../../store/timeline-store";
import StoryList from "../organisms/story-list";
import { PostsResponse, selectTimelineState, TimelinePost } from "../../types/post";

const normalizePost = (post: TimelinePost): TimelinePost => ({
  ...post,
  content: {
    ...post.content,
    htmltext: post.content?.htmltext ?? post.content?.html,
  },
});

const getUniquePosts = (existingPosts: TimelinePost[] | null, incomingPosts: TimelinePost[]) => {
  const existingIds = new Set(existingPosts?.map((post) => post.id).filter(Boolean) ?? []);
  return incomingPosts.filter((post) => !post.id || !existingIds.has(post.id));
};

const isPostsResponse = (response: unknown): response is PostsResponse => {
  return typeof response === "object" && response !== null;
};

export default function Timeline() {
  const user: User = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();
  const {
    posts,
    hasMore,
    page,
    isFetching,
    prependPost,
    appendPosts,
    setHasMore,
    setIsFetching,
    incrementPage,
    reset,
  } = useTimelineStore(useShallow(selectTimelineState));
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const userId = ownerAccountStore.getState().user?.userId;

  useEffect(() => {
    if (user?.userId) {
      setResolvedUserId(user.userId);
      return;
    }

    const token = getCookie("access-token");
    if (!token) return;

    if (userId) {
      setResolvedUserId(userId);
    }
  }, [user?.userId]);

  useEffect(() => {
    reset();
  }, [resolvedUserId, reset]);

  const fetchPosts = useCallback(async () => {
    const { isFetching: fetching, hasMore: more, page: currentPage, posts: currentPosts } =
      useTimelineStore.getState();

    if (fetching || !more || !resolvedUserId) return;

    setIsFetching(true);
    const response = await getPosts(resolvedUserId, currentPage);
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
  }, [resolvedUserId, appendPosts, incrementPage, setHasMore, setIsFetching]);

  useEffect(() => {
    if (!resolvedUserId) return;
    const { posts: currentPosts, page: currentPage } = useTimelineStore.getState();
    if (currentPosts !== null || currentPage !== 0) return;

    fetchPosts();
  }, [fetchPosts, resolvedUserId]);

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

  const handleOpenCreatePost = useCallback(() => {
    showPopup("Tạo bài viết", <CreatePostForm onPostCreated={handlePostCreated} />);
  }, [handlePostCreated, showPopup]);

  return (
    <div className="sm:pb-6">
      <div className="mx-auto w-full max-w-160 space-y-3 px-2 md:pt-2 sm:px-4 sm:pb-0 lg:px-0 lg:pt-3">
        <StoryList createPost={handleOpenCreatePost} />
        <PostList posts={posts} fetchPosts={fetchPosts} hasMore={hasMore} cardStyle />
      </div>
    </div>
  );
}
