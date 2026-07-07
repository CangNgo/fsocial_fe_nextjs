"use client";
import { getPost, getPosts } from "@/services/posts/posts-api";
import { postKeys } from "@/services/posts/post.key";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useHomePosts(userId: string) {
  return useInfiniteQuery({
    queryKey: postKeys.home(),
    queryFn: ({ pageParam }) => getPosts(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data && lastPage.data.length > 0 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!userId,
  });
}

export function usePostDetail(userId: string, postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPost(userId, postId),
    enabled: !!userId && !!postId,
  });
}
