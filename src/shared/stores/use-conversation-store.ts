"use client";
import { getConversations } from "@/services/message/message-api";
import type { Conversation, Message } from "@/shared/types/message";
import { create } from "zustand";
import { ownerAccountStore } from "./owner-account-store";
import { useWebSocketStore } from "./websocket-store";

type FetchStatus = "idle" | "loading" | "ready";

interface ConversationState {
  conversations: Conversation[];
  // Chỉ giữ id, object lấy từ `conversations` qua selectActiveConversation — tránh 2 bản
  // sao lệch nhau (online/unread/lastMessage cập nhật trên list sẽ không tới được header).
  activeConversationId: string | null;
  isThreadOpen: boolean;
  status: FetchStatus;
}

interface ConversationActions {
  fetchConversations: () => Promise<void>;
  addConversation: (conversation: Conversation) => void;
  addDraftConversation: (conversation: Conversation) => void;
  removeDraftConversations: () => void;
  removeConversation: (id: string) => void;
  applyIncomingMessage: (message: Message) => void;
  resetConversationUnread: (id: string) => void;
  setActiveConversation: (id: string | null) => void;
  setThreadOpen: (isThreadOpen: boolean) => void;
  getDirectPartnerIds: () => string[];
  setOnlineStatuses: (online: Record<string, boolean>) => void;
  reset: () => void;
}

type ConversationStore = ConversationState & ConversationActions;

const initialState: ConversationState = {
  conversations: [],
  activeConversationId: null,
  isThreadOpen: false,
  status: "idle",
};

// Với conversation DIRECT: nhóm >1 member -> lấy member khác mình; tự chat (1 member) -> lấy chính mình.
const directPartner = (conversation: Conversation, selfId?: string) =>
  conversation.members.length > 1
    ? conversation.members.find((member) => member.userId !== selfId)
    : conversation.members.find((member) => member.userId === selfId);

// Conversation từ API (fetch list hoặc create) chưa có name/avatarUrl ở top-level, phải suy ra từ partner.
const enrichConversation = (conversation: Conversation, selfId?: string): Conversation => {
  if (conversation.type !== "DIRECT") return conversation;
  const partner = directPartner(conversation, selfId);
  return { ...conversation, name: partner?.displayName, avatarUrl: partner?.avatar };
};

export const useConversationStore = create<ConversationStore>()((set, get) => ({
  ...initialState,

  fetchConversations: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    const resp = await getConversations();
    const conversations = resp?.statusCode === 200 ? (resp.data ?? []) : [];
    const userId = ownerAccountStore.getState().user.id;

    set({
      conversations: conversations.map((item) => enrichConversation(item, userId)),
      status: "ready",
    });
  },

  addConversation: (conversation) =>
    set((state) => {
      const userId = ownerAccountStore.getState().user.id;
      return { conversations: [enrichConversation(conversation, userId), ...state.conversations] };
    }),

  // Chỉ cho phép 1 draft tồn tại cùng lúc — chọn user mới thay thế draft cũ chưa gửi.
  addDraftConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations.filter((c) => !c.isDraft)],
    })),

  removeDraftConversations: () =>
    set((state) =>
      state.conversations.some((c) => c.isDraft)
        ? { conversations: state.conversations.filter((c) => !c.isDraft) }
        : state,
    ),

  removeConversation: (id) =>
    set((state) => ({ conversations: state.conversations.filter((c) => c.id !== id) })),

  // per-conversation unread bump + move-to-top khi có tin nhắn realtime.
  applyIncomingMessage: (message) =>
    set((state) => {
      const existing = state.conversations.find((c) => c.id === message.conversationId);
      if (!existing) return state;
      const isActive = state.activeConversationId === existing.id;
      const updated: Conversation = {
        ...existing,
        lastMessage: message,
        unreadCount: isActive ? existing.unreadCount : existing.unreadCount + 1,
      };
      return {
        conversations: [updated, ...state.conversations.filter((c) => c.id !== existing.id)],
      };
    }),

  resetConversationUnread: (id) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c,
      ),
    })),

  setActiveConversation: (activeConversationId) => {
    set({ activeConversationId });
    if (!activeConversationId) return;

    const conversation = get().conversations.find((c) => c.id === activeConversationId);
    if (!conversation || conversation.isDraft) return;

    useWebSocketStore.getState().client?.publish({
      destination: "/app/chat/mark-read",
      body: JSON.stringify({ conversationId: activeConversationId }),
    });
  },

  setThreadOpen: (isThreadOpen) => set({ isThreadOpen }),

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
      return {
        conversations: state.conversations.map((c) => {
          if (c.type !== "DIRECT") return c;
          const partnerId = directPartner(c, userId)?.userId;
          if (!partnerId || !(partnerId in online)) return c;
          return { ...c, online: online[partnerId] };
        }),
      };
    }),

  reset: () => set(initialState),
}));

export const selectActiveConversation = (state: ConversationStore): Conversation | null =>
  state.conversations.find((c) => c.id === state.activeConversationId) ?? null;

export const selectTotalUnread = (state: ConversationStore): number =>
  state.conversations.reduce((sum, c) => sum + c.unreadCount, 0);

export const conversationStore = useConversationStore;
