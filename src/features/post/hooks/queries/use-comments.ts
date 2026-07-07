"use client";
import { getComments } from "@/services/post/comment-api";
import { postKeys } from "@/services/posts/post.key";
import { useQuery } from "@tanstack/react-query";

export function useComments(postId: string) {
  return useQuery({
    queryKey: postKeys.comments.list(postId),
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });
}
