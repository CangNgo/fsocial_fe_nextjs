"use client";
import { createPost, likePost } from "@/services/posts/posts-api";
import { postKeys } from "@/services/posts/post.key";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.home() });
      toast.success("Đăng bài thành công");
    },
    onError: () => toast.error("Đăng bài thất bại"),
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });
}
