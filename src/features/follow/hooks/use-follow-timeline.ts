"use client";

import { postKeys } from "@/services/posts/post.key";
import { getFollowingPosts } from "@/services/posts/posts-api";
import CreatePostForm from "@/shared/components/organisms/create-post-form";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createElement, useCallback } from "react";

export function useFollowTimeline() {
  const user = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();

  const query = useInfiniteQuery({
    queryKey: postKeys.follow(),
    queryFn: ({ pageParam }) => getFollowingPosts(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data && lastPage.data.length > 0 ? (lastPageParam as number) + 1 : undefined,
  });

  const posts = query.data ? query.data.pages.flatMap((page) => page?.data ?? []) : null;

  // const handlePostCreated = useCallback(
  //   (post: Record<string, unknown>) => {
  //     const normalizedPost = post as unknown as FollowPost;
  //     queryClient.setQueryData(postKeys.follow(), (data: typeof query.data) =>
  //       data
  //         ? {
  //             ...data,
  //             pages: data.pages.map((page, index) =>
  //               index === 0 ? { ...page, data: [normalizedPost, ...(page?.data ?? [])] } : page,
  //             ),
  //           }
  //         : data,
  //     );
  //   },
  //   [queryClient],
  // );

  const handleOpenCreatePost = useCallback(() => {
    showPopup("Tạo bài viết", createElement(CreatePostForm));
  }, [showPopup]);

  return {
    user,
    posts,
    fetchPosts: () => query.fetchNextPage(),
    hasMore: query.hasNextPage,
    handleOpenCreatePost,
  };
}
