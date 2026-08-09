"use client";
import { Client } from "@stomp/stompjs";
import { create } from "zustand";
import type { Message } from "@/shared/types/message";
import { getCookie } from "@/shared/utils/cookie";

interface MessageStore {
  messages: Message[] | null;
  activeConversationId: string | null;
  stompClientMessage: Client | null;
  incomingMessage: Message | null;

  setMessages: (messages: Message[] | null) => void;
  appendMessage: (message: Message) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  connectMessageWebSocket: () => void;
  cleanMessageWebSocket: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  setIncomingMessage: (message: Message | null) => void;
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
  messages: null,
  activeConversationId: null,
  stompClientMessage: null,
  incomingMessage: null,

  setMessages: (messages) => set({ messages }),
  appendMessage: (message) =>
    set((state) => ({ messages: [...(state.messages ?? []), message] })),
  setActiveConversationId: (conversationId) => set({ activeConversationId: conversationId }),

  connectMessageWebSocket: () => {
    if (get().stompClientMessage) return;

    const wsHost =
      process.env.NEXT_PUBLIC_WS_HOST_MESSAGE ?? process.env.NEXT_PUBLIC_WS_HOST ?? "localhost:8080";
    const wsProtocol = process.env.NEXT_PUBLIC_WS_PROTOCOL ?? "ws";
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION ?? "api/v1";
    const messageBaseURL = `${wsProtocol}://${wsHost}/${apiVersion}/ws`;
    const token = getCookie("access-token");

    const client = new Client({
      brokerURL: messageBaseURL,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 10000,
      onConnect: () => {
        client.subscribe("/user/queue/messages", (frame) => {
          const receivedMessage = JSON.parse(frame.body) as Message;
          const { activeConversationId } = get();
          if (receivedMessage.conversationId === activeConversationId) {
            get().appendMessage(receivedMessage);
          }
          get().setIncomingMessage(receivedMessage);
        });
      },
    });
    client.activate();
    set({ stompClientMessage: client });
  },

  cleanMessageWebSocket: () => {
    const { stompClientMessage } = get();
    if (!stompClientMessage) return;
    stompClientMessage.deactivate().then(() => {
      set({
        messages: null,
        activeConversationId: null,
        stompClientMessage: null,
        incomingMessage: null,
      });
    });
  },

  sendMessage: (conversationId, content) => {
    const { stompClientMessage } = get();
    if (!stompClientMessage?.connected) return;

    stompClientMessage.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ conversationId, content, messageType: "TEXT" }),
    });
  },

  setIncomingMessage: (incomingMessage) => set({ incomingMessage }),
}));
