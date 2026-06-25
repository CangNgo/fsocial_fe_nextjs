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

interface TimelinePost {
  id?: string;
  displayName?: string;
  avatar?: string | null;
  [key: string]: unknown;
}

interface PostsResponse {
  statusCode?: number;
  data?: TimelinePost[];
}

const selectTimelineState = (state: ReturnType<typeof useTimelineStore.getState>) => ({
  posts: state.posts,
  hasMore: state.hasMore,
  page: state.page,
  isFetching: state.isFetching,
  prependPost: state.prependPost,
  appendPosts: state.appendPosts,
  setHasMore: state.setHasMore,
  setIsFetching: state.setIsFetching,
  incrementPage: state.incrementPage,
  reset: state.reset,
});

const getUniquePosts = (existingPosts: TimelinePost[] | null, incomingPosts: TimelinePost[]) => {
  const existingIds = new Set(existingPosts?.map((post) => post.id).filter(Boolean) ?? []);
  return incomingPosts.filter((post) => !post.id || !existingIds.has(post.id));
};

const getUserIdFromToken = (token: string) => {
  try {
    const { sub } = jwtDecode<{ sub: string }>(token);
    return sub ?? null;
  } catch {
    return null;
  }
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

  useEffect(() => {
    if (user?.userId) {
      setResolvedUserId(user.userId);
      return;
    }

    const token = getCookie("access-token");
    if (!token) return;

    const tokenUserId = getUserIdFromToken(token);
    if (tokenUserId) {
      setResolvedUserId(tokenUserId);
    }
  }, [user?.userId]);

  useEffect(() => {
    reset();
  }, [resolvedUserId, reset]);

  const fetchPosts = useCallback(async () => {
    if (isFetching || !hasMore || !resolvedUserId) return;

    setIsFetching(true);
    const response = await getPosts(resolvedUserId, page);
    setIsFetching(false);

    if (!isPostsResponse(response) || response.statusCode !== 200) {
      return;
    }

    const newPosts = Array.isArray(response.data) ? response.data : [];

    if (newPosts.length === 0) {
      setHasMore(false);
      return;
    }

    const uniquePosts = getUniquePosts(posts as TimelinePost[] | null, newPosts);
    if (uniquePosts.length > 0) {
      appendPosts(uniquePosts);
    }

    incrementPage();
  }, [
    appendPosts,
    hasMore,
    incrementPage,
    isFetching,
    page,
    posts,
    resolvedUserId,
    setHasMore,
    setIsFetching,
  ]);

  useEffect(() => {
    if (!resolvedUserId || isFetching || posts !== null || page !== 0) {
      return;
    }

    fetchPosts();
  }, [fetchPosts, isFetching, page, posts, resolvedUserId]);

  const handlePostCreated = useCallback(
    (post: TimelinePost) => {
      const normalizedHtmlText =
        typeof post.content === "object" && post.content !== null && "htmltext" in post.content
          ? post.content.htmltext
          : typeof post.HTMLText === "string"
            ? post.HTMLText
            : typeof post.htmltext === "string"
              ? post.htmltext
              : undefined;

      const normalizedText =
        typeof post.content === "object" && post.content !== null && "text" in post.content
          ? post.content.text
          : typeof post.text === "string"
            ? post.text
            : contentToPlainText(normalizedHtmlText);

      prependPost({
        ...post,
        displayName: post.displayName ?? user?.displayName,
        avatar: post.avatar ?? user?.avatar,
        content:
          typeof post.content === "object" && post.content !== null
            ? {
                ...post.content,
                text: normalizedText,
                htmltext: normalizedHtmlText ?? post.content.htmltext,
              }
            : {
                text: normalizedText,
                htmltext: normalizedHtmlText,
              },
      });
    },
    [prependPost, user?.avatar, user?.displayName],
  );

  function contentToPlainText(htmlText: string | undefined) {
    if (!htmlText) return "";
    return htmlText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

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
