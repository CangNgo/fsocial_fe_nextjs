import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { Conversation, ConversationType, Message } from "@/shared/types/message";

export const getConversations = async (): Promise<ApiResponse<Conversation[]> | null> => {
  return apiGet<Conversation[]>("/conversations");
};

// Backend trả data dạng mảng phẳng (không có items/hasMore/nextCursor) — xem ConversationController#getMessages
export const getMessages = async (
  conversationId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<ApiResponse<Message[]> | null> => {
  return apiGet<Message[]>(`/conversations/${conversationId}/messages`, {
    params: { cursor },
    signal,
  });
};

export const createConversation = async (
  memberIds: string[],
  type: ConversationType = "DIRECT",
  name?: string,
): Promise<ApiResponse<Conversation> | null> => {
  return apiPost<Conversation>("/conversations", { memberIds, type, name });
};
