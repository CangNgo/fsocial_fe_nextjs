"use client";
import { getConversations } from "@/services/message/message-api";
import type { Conversation, Message } from "@/shared/types/message";
import { create } from "zustand";
import { ownerAccountStore } from "./owner-account-store";
import { useWebSocketStore } from "./websocket-store";

interface ConversationState {
  conversations: Conversation[] | [];
  activeConversation: Conversation | null;
  unreadCount: number;
  contentActive: number;
  isLoading: boolean;
  hasFetched: boolean;
}

interface ConversationActions {
  fetchConversations: () => Promise<void>;
  setConversations: (conversations: Conversation[] | []) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  applyIncomingMessage: (message: Message) => void;
  resetConversationUnread: (id: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  clearActiveConversation: () => void;
  setContentActive: (contentActive: number) => void;
  getDirectPartnerIds: () => string[];
  setOnlineStatuses: (online: Record<string, boolean>) => void;
  reset: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

const initialState: ConversationState = {
  conversations: [],
  activeConversation: null,
  unreadCount: 0,
  contentActive: 0,
  isLoading: false,
  hasFetched: false,
};

const sumUnread = (conversations: Conversation[]) =>
  conversations.reduce((sum, c) => sum + c.unreadCount, 0);

// Với conversation DIRECT: nhóm >1 member -> lấy member khác mình; tự chat (1 member) -> lấy chính mình.
const directPartner = (conversation: Conversation, selfId?: string) =>
  conversation.members.length > 1
    ? conversation.members.find((member) => member.userId !== selfId)
    : conversation.members.find((member) => member.userId === selfId);

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  ...initialState,

  fetchConversations: async () => {
    if (get().isLoading || get().hasFetched) return;
    set({ isLoading: true });
    const resp = await getConversations();
    const conversations = resp?.statusCode === 200 ? (resp.data ?? []) : [];
    const userId = ownerAccountStore.getState().user.id;
    const data = conversations.map((item) => {
      if (item.type !== "DIRECT") return item;

      if (item.members.length > 1) {
        const sender = item.members.find((member) => member.userId !== userId);
        return {
          ...item,
          name: sender?.displayName,
          avatarUrl: sender?.avatar,
        };
      } else {
        const sender = item.members.find((member) => member.userId === userId);
        return {
          ...item,
          name: sender?.displayName,
          avatarUrl: sender?.avatar,
        }
      }
    });

    set({
      conversations: data,
      unreadCount: sumUnread(conversations),
      isLoading: false,
      hasFetched: true,
    });
  },

  setConversations: (conversations) =>
    set({ conversations, unreadCount: conversations ? sumUnread(conversations) : 0 }),

  addConversation: (conversation) =>
    set((state) => {
      const conversations = [conversation, ...(state.conversations ?? [])];
      return { conversations, unreadCount: sumUnread(conversations) };
    }),

  updateConversation: (id, patch) =>
    set((state) => {
      if (!state.conversations) return state;
      const conversations = state.conversations.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return { conversations, unreadCount: sumUnread(conversations) };
    }),

  removeConversation: (id) =>
    set((state) => {
      if (!state.conversations) return state;
      const conversations = state.conversations.filter((c) => c.id !== id);
      return { conversations, unreadCount: sumUnread(conversations) };
    }),

  // per-conversation unread bump + move-to-top on a new realtime message, same behavior use-message-subscription.ts used to do via queryClient.setQueryData
  applyIncomingMessage: (message) =>
    set((state) => {
      if (!state.conversations) return state;
      const existing = state.conversations.find((c) => c.id === message.conversationId);
      if (!existing) return state;
      const isActive = state.activeConversation?.id === existing.id;
      const updated: Conversation = {
        ...existing,
        lastMessage: message,
        unreadCount: isActive ? existing.unreadCount : existing.unreadCount + 1,
      };
      const conversations = [updated, ...state.conversations.filter((c) => c.id !== existing.id)];
      return { conversations, unreadCount: sumUnread(conversations) };
    }),

  resetConversationUnread: (id) =>
    set((state) => {
      if (!state.conversations) return state;
      const conversations = state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c,
      );
      return { conversations, unreadCount: sumUnread(conversations) };
    }),

  setActiveConversation: (activeConversation) => {
    const { client } = useWebSocketStore.getState();
    set({ activeConversation });

    client?.publish({
      destination: "/app/chat/mark-read",
      body: JSON.stringify({ conversationId: activeConversation?.id }),
    });
  },
  clearActiveConversation: () => set({ activeConversation: null }),
  setContentActive: (contentActive) => set({ contentActive }),

  getDirectPartnerIds: () => {
    const userId = ownerAccountStore.getState().user.id;
    return get()
      .conversations.filter((c) => c.type === "DIRECT")
      .map((c) => directPartner(c, userId)?.userId)
      .filter((id): id is string => Boolean(id));
  },

  setOnlineStatuses: (online) =>
    set((state) => {
      const userId = ownerAccountStore.getState().user.id;
      const conversations = state.conversations.map((c) => {
        if (c.type !== "DIRECT") return c;
        const partnerId = directPartner(c, userId)?.userId;
        if (!partnerId || !(partnerId in online)) return c;
        return { ...c, online: online[partnerId] };
      });
      return { conversations };
    }),

  reset: () => set(initialState),
}));

export const conversationStore = useConversationStore;
