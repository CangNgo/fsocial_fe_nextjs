import { apiGet, apiPost } from "@/shared/api/core/api-service";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export async function getConversations(): Promise<unknown> {
  const userId = ownerAccountStore.getState().user.id;
  return apiGet(`/conversations/user/${userId}`);
}

export async function getMessages(conversationId: string, signal?: AbortSignal): Promise<unknown> {
  return apiGet(`/messages/${conversationId}`, signal ? { signal } : undefined);
}

export async function createConversation(receiverId: string): Promise<unknown> {
  const user = ownerAccountStore.getState().user;
  const senderId = user.id;
  return apiPost("/conversations", { senderId, receiverId });
}
