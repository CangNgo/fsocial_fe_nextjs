"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { postKeys } from "@/services/posts/post.key";
import { getPosts } from "@/services/posts/posts-api";

const POSTS_TAB_INDEX = 0;

export function useProfilePosts(profilePostUserId?: string | null, currentTab?: number | null) {
  const query = useInfiniteQuery({
    queryKey: postKeys.profile(profilePostUserId ?? ""),
    queryFn: ({ pageParam }) => getPosts(profilePostUserId as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data && lastPage.data.length > 0 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!profilePostUserId && currentTab === POSTS_TAB_INDEX,
  });

  const postsUser = query.data ? query.data.pages.flatMap((page) => page?.data ?? []) : null;

  return {
    postsUser,
    fetchPostsUser: () => query.fetchNextPage(),
    hasMorePosts: query.hasNextPage,
  };
}
