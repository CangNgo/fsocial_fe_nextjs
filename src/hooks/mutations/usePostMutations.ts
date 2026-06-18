"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/apiService";
import { queryKeys } from "@/lib/queryKeys";

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
