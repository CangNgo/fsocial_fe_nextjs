import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { Conversation, MessagesThread } from "@/shared/types/message";

export const getConversations = async (
  userId: string,
): Promise<ApiResponse<Conversation[]> | null> => {
  return apiGet<Conversation[]>(`/conversations/user/${userId}`);
};

export const getMessages = async (
  conversationId: string,
  signal?: AbortSignal,
): Promise<ApiResponse<MessagesThread> | null> => {
  return apiGet<MessagesThread>(`/messages/${conversationId}`, signal ? { signal } : undefined);
};

export const createConversation = async (
  senderId: string,
  receiverId: string,
): Promise<ApiResponse<Conversation> | null> => {
  return apiPost<Conversation>("/conversations", { senderId, receiverId });
};
