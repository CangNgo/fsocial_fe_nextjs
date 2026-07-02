import { apiGet, apiPost } from "@/shared/api/core/api-service";

export const getComments = async (postId: string): Promise<unknown> => {
  return apiGet(`/comment?postId=${postId}`);
};

export const sendComment = async (data: unknown): Promise<unknown> => {
  return apiPost("/comment", data);
};

export async function likeComment(sendingData: unknown): Promise<unknown> {
  return apiPost("/comment/like", sendingData, undefined, {});
}

export const replyComment = async (data: unknown): Promise<unknown> => {
  return apiPost("/comment/reply", data);
};

export const getRepliesComment = async (commentId: string): Promise<unknown> => {
  return apiGet(`/comment/reply?comment_id=${commentId}`);
};
