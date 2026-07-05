"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/shared/api/core/api-service";
import { postKeys } from "@/shared/keys/post.key";
import type { Comment } from "../../types/comment";

async function getComments(postId: string) {
  return apiGet<Comment[]>(`/comment?postId=${postId}`);
}

export function useComments(postId: string) {
  return useQuery({
    queryKey: postKeys.comments.list(postId),
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });
}
