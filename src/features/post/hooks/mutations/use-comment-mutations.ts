"use client";
import {
  getRepliesComment,
  likeComment,
  replyComment,
  sendComment,
} from "@/services/post/comment-api";
import { postKeys } from "@/services/posts/post.key";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
