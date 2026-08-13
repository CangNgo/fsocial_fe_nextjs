"use client";
import { getConversations } from "@/services/message/message-api";
import type { Conversation, Message } from "@/shared/types/message";
import { create } from "zustand";
import { useWebSocketStore } from "./websocket-store";

interface ConversationState {
  conversations: Conversation[] | null;
  activeConversation: Conversation | null;
  unreadCount: number;
  contentActive: number;
  isLoading: boolean;
}

interface ConversationActions {
  fetchConversations: () => Promise<void>;
  setConversations: (conversations: Conversation[] | null) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  applyIncomingMessage: (message: Message) => void;
  resetConversationUnread: (id: string) => void;
  setActiveConversation: (conversation: Conversation | null) => void;
  clearActiveConversation: () => void;
  setContentActive: (contentActive: number) => void;
  reset: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

const initialState: ConversationState = {
  conversations: null,
  activeConversation: null,
  unreadCount: 0,
  contentActive: 0,
  isLoading: false,
};

const sumUnread = (conversations: Conversation[]) =>
  conversations.reduce((sum, c) => sum + c.unreadCount, 0);

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  ...initialState,

  fetchConversations: async () => {
    if (get().isLoading || get().conversations) return;
    set({ isLoading: true });
    const resp = await getConversations();
    const conversations = resp?.statusCode === 200 ? (resp.data ?? []) : [];
    set({ conversations, unreadCount: sumUnread(conversations), isLoading: false });
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
  reset: () => set(initialState),
}));

export const conversationStore = useConversationStore;
