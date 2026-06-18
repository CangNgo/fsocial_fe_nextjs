"use client";
import { Client, type StompSubscription } from "@stomp/stompjs";
import { create } from "zustand";
import { ownerAccountStore } from "./ownerAccountStore";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  createAt: string;
  type?: string;
}

interface Conversation {
  id: string;
  receiverId: string;
  [key: string]: unknown;
}

interface MessageStore {
  ready: boolean;
  messages: Message[] | null;
  conversation: Conversation | null;
  stompClientMessage: Client | null;
  subscription: StompSubscription[] | null;
  newMessage: Message | null;

  setReady: (ready: boolean) => void;
  setMessages: (messages: Message[]) => void;
  setConversation: (conversation: Conversation | null) => void;
  connectMessageWebSocket: (userId: string) => void;
  setSubscription: (conversationId: string) => void;
  cleanMessageWebSocket: () => void;
  sendMessage: (content: string, id?: string) => void;
  setNewMessage: (newMessage: Message | null) => void;
}

export const useMessageStore = create<MessageStore>()((set, get) => ({
  ready: false,
  messages: null,
  conversation: null,
  stompClientMessage: null,
  subscription: null,
  newMessage: null,

  setReady: (ready) => set({ ready }),
  setMessages: (messages) => set({ messages }),
  setConversation: (conversation) => set({ conversation }),

  connectMessageWebSocket: (userId) => {
    const { stompClientMessage } = get();
    if (stompClientMessage) return;

    const wsHost =
      process.env.NEXT_PUBLIC_WS_HOST_MESSAGE ??
      process.env.NEXT_PUBLIC_WS_HOST ??
      "localhost:8888";
    const wsProtocol = process.env.NEXT_PUBLIC_WS_PROTOCOL ?? "ws";
    const messageBaseURL = `${wsProtocol}://${wsHost}/post/ws`;

    const client = new Client({
      brokerURL: messageBaseURL,
      reconnectDelay: 10000,
      onConnect: () => {
        client.subscribe(`/queue/private-${userId}`, (message) => {
          const receivedMessage = JSON.parse(message.body) as Message;
          get().setNewMessage(receivedMessage);
        });
        set({ stompClientMessage: client });
      },
    });
    client.activate();
  },

  setSubscription: (conversationId) => {
    const userId = ownerAccountStore.getState().user?.userId;
    const { subscription, stompClientMessage } = get();

    if (!stompClientMessage?.connected) {
      return;
    }

    if (subscription) {
      subscription.forEach((sub) => {
        sub.unsubscribe();
      });
    }

    const subTriggerMessage = stompClientMessage.subscribe(
      `/queue/private-${conversationId}`,
      (message) => {
        const receivedMessage = JSON.parse(message.body) as Message;
        if (receivedMessage.receiverId !== userId) return;
        const currentMessages = get().messages ?? [];
        set({ messages: [...currentMessages, receivedMessage] });
      },
    );

    const subTriggerSideAction = stompClientMessage.subscribe(
      `/queue/actions-${conversationId}`,
      () => {},
    );

    set({ subscription: [subTriggerMessage, subTriggerSideAction] });
  },

  cleanMessageWebSocket: () => {
    const { stompClientMessage } = get();
    if (!stompClientMessage) return;
    stompClientMessage.deactivate().then(() => {
      set({
        ready: false,
        messages: null,
        conversation: null,
        stompClientMessage: null,
        subscription: null,
        newMessage: null,
      });
    });
  },

  sendMessage: (content, id) => {
    const { stompClientMessage, conversation } = get();
    if (!stompClientMessage?.connected || !conversation) return;

    stompClientMessage.publish({
      destination: "/app/chat.private",
      body: JSON.stringify({
        receiverId: conversation.receiverId,
        conversationId: id ?? conversation.id,
        content,
      }),
    });
  },

  setNewMessage: (newMessage) => set({ newMessage }),
}));
