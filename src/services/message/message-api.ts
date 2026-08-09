import { apiGet, apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { Conversation, ConversationType, Message } from "@/shared/types/message";

export const getConversations = async (): Promise<ApiResponse<Conversation[]> | null> => {
  return apiGet<Conversation[]>("/conversations");
};

export const getMessages = async (
  conversationId: string,
  cursor?: string,
  signal?: AbortSignal,
): Promise<ApiResponse<Message[]> | null> => {
  const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
  return apiGet<Message[]>(`/conversations/${conversationId}/messages${query}`, signal ? { signal } : undefined);
};

export const createConversation = async (
  memberIds: string[],
  type: ConversationType = "DIRECT",
  name?: string,
): Promise<ApiResponse<Conversation> | null> => {
  return apiPost<Conversation>("/conversations", { memberIds, type, name });
};
