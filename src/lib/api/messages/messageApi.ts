import { ownerAccountStore } from "@/store/ownerAccountStore";
import { apiGet, apiPost } from "../apiService";

export async function getConversations(): Promise<unknown> {
  const userId = ownerAccountStore.getState().user?.userId;
  return apiGet(`/post/conversations/user/${userId}`);
}

export async function getMessages(conversationId: string, signal?: AbortSignal): Promise<unknown> {
  return apiGet(`/post/messages/${conversationId}`, signal ? { signal } : undefined);
}

export async function createConversation(receiverId: string): Promise<unknown> {
  const user = ownerAccountStore.getState().user;
  const senderId = user?.userId;
  return apiPost("/post/conversations", { senderId, receiverId });
}
