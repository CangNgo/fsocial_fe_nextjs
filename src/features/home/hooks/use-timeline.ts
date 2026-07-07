"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { getPosts } from "@/services/posts/posts-api";
import { postKeys } from "@/services/posts/post.key";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { PostResponse } from "@/shared/types/post";
import { useTimelineStore } from "../stores/timeline-store";

export function useTimeline() {
  const user = ownerAccountStore((state) => state.user);
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: postKeys.home(),
    queryFn: ({ pageParam }) => getPosts(user.id as string, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage?.data && lastPage.data.length > 0 ? (lastPageParam as number) + 1 : undefined,
    enabled: !!user.id,
  });

  const posts = query.data ? query.data.pages.flatMap((page) => page?.data ?? []) : null;

  const updatePost = useCallback(
    (id: string, values: Partial<PostResponse>) => {
      queryClient.setQueryData(postKeys.home(), (data: typeof query.data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page
                  ? {
                      ...page,
                      data: page.data?.map((post) =>
                        post.id === id
                          ? {
                              ...post,
                              ...values,
                              content: values.content
                                ? { ...post.content, ...values.content }
                                : post.content,
                            }
                          : post,
                      ),
                    }
                  : page,
              ),
            }
          : data,
      );
    },
    [queryClient],
  );

  const deletePost = useCallback(
    (id: string) => {
      queryClient.setQueryData(postKeys.home(), (data: typeof query.data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page) =>
                page ? { ...page, data: page.data?.filter((post) => post.id !== id) } : page,
              ),
            }
          : data,
      );
    },
    [queryClient],
  );

  useEffect(() => {
    useTimelineStore.setState({ updatePost, deletePost });
  }, [updatePost, deletePost]);

  const prependPost = useCallback(
    (post: PostResponse) => {
      queryClient.setQueryData(postKeys.home(), (data: typeof query.data) =>
        data
          ? {
              ...data,
              pages: data.pages.map((page, index) =>
                index === 0 ? { ...page, data: [post, ...(page?.data ?? [])] } : page,
              ),
            }
          : data,
      );
    },
    [queryClient],
  );

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

  return {
    posts,
    hasMore: query.hasNextPage,
    fetchPosts: () => query.fetchNextPage(),
    handlePostCreated,
  };
}
