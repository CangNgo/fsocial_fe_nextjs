import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { apiDelete, apiGet, apiPost, apiPut } from "../core/api-service";

export const getPosts = async (userId: string, page = 0): Promise<unknown> => {
  return apiGet(`/actions?userId=${userId}&page=${page}`);
};

export const getPost = async (userId: string, postId: string): Promise<unknown> => {
  return apiGet(`/actions/getpost_id?user_id=${userId}&post_id=${postId}`);
};

export const likePost = async (postId: string): Promise<unknown> => {
  const user = ownerAccountStore.getState().user;
  const dataObj = { userId: user.id, postId };
  return apiPost("/actions/like", dataObj);
};

export const createPost = async (
  data: unknown,
  config: Record<string, unknown> = {},
): Promise<unknown> => {
  return apiPost("/actions", data, { ...config });
};

export const updatePost = async (data: unknown): Promise<unknown> => {
  return apiPut("/actions", data);
};

export const deletePost = async (id: string): Promise<unknown> => {
  return apiDelete(`/actions?postId=${id}`);
};

export const repostPost = async (data: unknown): Promise<unknown> => {
  return apiPost("/actions/share", data);
};

export const getFollowingPosts = async (page = 0): Promise<unknown> => {
  return apiGet(`/post?page=${page}`);
};

export const reportPost = async (data: unknown): Promise<unknown> => {
  return apiPost("/complaint", data);
};
