"use client";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/apiService";
import { queryKeys } from "@/lib/queryKeys";

async function getPosts(userId: string, page: number) {
  return apiGet<unknown[]>(`/posts`, { params: { userId, page } }, []);
}

async function getPost(postId: string) {
  return apiGet(`/posts/${postId}`);
}

export function useHomePosts(userId: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.posts.home(),
    queryFn: ({ pageParam }) => getPosts(userId, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      Array.isArray(lastPage) && lastPage.length > 0 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!userId,
  });
}

export function usePostDetail(postId: string) {
  return useQuery({
    queryKey: queryKeys.posts.detail(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId,
  });
}
