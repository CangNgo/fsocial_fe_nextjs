import { apiGet, apiPost } from "@/shared/api/core/api-service";

export const getComments = async (postId: string): Promise<unknown> => {
  return apiGet(`/post/comment?postId=${postId}`);
};

export const sendComment = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/comment", data);
};

export async function likeComment(sendingData: unknown): Promise<unknown> {
  return apiPost("/post/comment/like", sendingData, undefined, {});
}

export const replyComment = async (data: unknown): Promise<unknown> => {
  return apiPost("/post/comment/reply", data);
};

export const getRepliesComment = async (commentId: string): Promise<unknown> => {
  return apiGet(`/post/comment/reply?comment_id=${commentId}`);
};
