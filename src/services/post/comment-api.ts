import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { Comment } from "@/shared/types/comment";

export const getComments = async (postId: string): Promise<ApiResponse<Comment[]> | null> => {
  return apiGet<Comment[]>(`/comment?postId=${postId}`);
};

export const sendComment = async (data: unknown): Promise<ApiResponse<Comment> | null> => {
  return apiPost<Comment>("/comment", data);
};

export const likeComment = async (sendingData: unknown): Promise<ApiResponse<null> | null> => {
  return apiPost<null>("/comment/like", sendingData, undefined, {});
};

export const replyComment = async (data: unknown): Promise<ApiResponse<Comment> | null> => {
  return apiPost<Comment>("/comment/reply", data);
};

export const getRepliesComment = async (
  commentId: string,
): Promise<ApiResponse<Comment[]> | null> => {
  return apiGet<Comment[]>(`/comment/reply?comment_id=${commentId}`);
};
