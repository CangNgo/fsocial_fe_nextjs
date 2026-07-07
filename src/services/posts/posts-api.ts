import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { ApiResponse } from "@/shared/types/api-response";
import type { PostResponse } from "@/shared/types/post";
import { apiDelete, apiGet, apiPost, apiPut } from "../core/api-service";

export const getPosts = async (
  userId: string,
  page = 0,
): Promise<ApiResponse<PostResponse[]> | null> => {
  return apiGet<PostResponse[]>(`/actions?userId=${userId}&page=${page}`);
};

export const getPost = async (
  userId: string,
  postId: string,
): Promise<ApiResponse<PostResponse> | null> => {
  return apiGet<PostResponse>(`/actions/getpost_id?user_id=${userId}&post_id=${postId}`);
};

export const likePost = async (postId: string): Promise<ApiResponse<null> | null> => {
  const user = ownerAccountStore.getState().user;
  const dataObj = { userId: user.id, postId };
  return apiPost<null>("/actions/like", dataObj);
};

export const createPost = async (
  data: FormData,
  config: Record<string, unknown> = {},
): Promise<ApiResponse<PostResponse> | null> => {
  return apiPost<PostResponse>("/actions", data, { ...config });
};

export const updatePost = async (data: FormData): Promise<ApiResponse<PostResponse> | null> => {
  return apiPut<PostResponse>("/actions", data);
};

export const deletePost = async (id: string): Promise<ApiResponse<null> | null> => {
  return apiDelete<null>(`/actions?postId=${id}`);
};

export const repostPost = async (data: FormData): Promise<ApiResponse<PostResponse> | null> => {
  return apiPost<PostResponse>("/actions/share", data);
};

export const getFollowingPosts = async (page = 0): Promise<ApiResponse<PostResponse[]> | null> => {
  return apiGet<PostResponse[]>(`/post?page=${page}`);
};

export const reportPost = async (data: unknown): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/complaint", data);
};
