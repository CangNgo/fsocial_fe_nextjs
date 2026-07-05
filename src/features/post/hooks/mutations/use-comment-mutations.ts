"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/shared/api/core/api-service";
import { postKeys } from "@/shared/keys/post.key";
import type { Comment } from "../../types/comment";

async function sendComment(data: unknown) {
  return apiPost<Comment>("/comment", data);
}

async function likeComment(sendingData: unknown) {
  return apiPost("/comment/like", sendingData, undefined, {});
}

async function replyComment(data: unknown) {
  return apiPost<Comment>("/comment/reply", data);
}

async function getRepliesComment(commentId: string) {
  return apiGet<Comment[]>(`/comment/reply?comment_id=${commentId}`);
}

export function useSendComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments.list(postId) });
    },
  });
}

export function useLikeComment() {
  return useMutation({
    mutationFn: likeComment,
  });
}

export function useReplyComment(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replyComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments.list(postId) });
    },
  });
}

export function useRepliesComment() {
  return useMutation({
    mutationFn: getRepliesComment,
  });
}
