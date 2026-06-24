"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/shared/api/core/api-service";
import { queryKeys } from "@/shared/lib/query-keys";

async function createPost(payload: unknown) {
  return apiPost("/posts", payload);
}

async function likePost(postId: string) {
  return apiPost(`/posts/${postId}/like`);
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.home() });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}
