"use client";
import { startOnlineHeartbeat, stopOnlineHeartbeat } from "@/services/online/online-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { useWebSocketStore } from "@/shared/stores/websocket-store";
import type { Message, MessageStatus } from "@/shared/types/message";
import type { StompSubscription } from "@stomp/stompjs";
import { create } from "zustand";

let unsubscribeConnect: (() => void) | null = null;
let messageSub: StompSubscription | null = null;
let errorSub: StompSubscription | null = null;

interface MessageStore {
  messages: Message[] | null;

  setMessages: (messages: Message[] | null) => void;
  appendMessage: (message: Message) => void;
  prependMessages: (olderMessages: Message[]) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus | undefined) => void;
  connectMessageWebSocket: () => void;
  cleanMessageWebSocket: () => void;
  sendMessage: (conversationId: string, content: string) => void;
  retryMessage: (messageId: string) => void;
}

const TEMP_ID_PREFIX = "temp-";

export const useMessageStore = create<MessageStore>()((set, get) => ({
  messages: null,

  setMessages: (messages) => set({ messages }),
  appendMessage: (message) => set((state) => ({ messages: [...(state.messages ?? []), message] })),

  // Nối tin nhắn cũ hơn vào đầu mảng khi load thêm (scroll up), không đụng vào tin
  // nhắn realtime/optimistic đang có ở cuối mảng. Lọc trùng id phòng trường hợp trang
  // cursor chồng lấn (lệch giây do backend cắt millisecond khi parse cursor).
  prependMessages: (olderMessages) =>
    set((state) => {
      const existingIds = new Set((state.messages ?? []).map((m) => m.id));
      const uniqueOlder = olderMessages.filter((m) => !existingIds.has(m.id));
      return { messages: [...uniqueOlder, ...(state.messages ?? [])] };
    }),

  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages?.map((m) => (m.id === messageId ? { ...m, status } : m)) ?? null,
    })),

  connectMessageWebSocket: () => {
    if (unsubscribeConnect) return;

    const { connect, onConnect } = useWebSocketStore.getState();
    const client = connect();

    unsubscribeConnect = onConnect(() => {
      startOnlineHeartbeat();

      // Reconnect (mất mạng/máy sleep) gọi lại onConnect trên cùng client, nên phải huỷ
      // subscription cũ trước khi tạo mới — nếu không, mỗi lần reconnect sẽ cộng dồn
      // subscription mới vào client mà không bao giờ được giải phóng.
      messageSub?.unsubscribe();
      errorSub?.unsubscribe();

      messageSub = client.subscribe("/user/queue/messages", (frame) => {
        const receivedMessage = JSON.parse(frame.body) as Message;

        const conversationStore = useConversationStore.getState();
        if (receivedMessage.conversationId === conversationStore.activeConversationId) {
          resolveIncomingMessage(receivedMessage, get, set);
        }
        conversationStore.applyIncomingMessage(receivedMessage);
      });

      errorSub = client.subscribe("/user/queue/errors", (frame) => {
        console.error("[WS] server error:", frame.body);
      });
    });
  },

  cleanMessageWebSocket: () => {
    stopOnlineHeartbeat();
    unsubscribeConnect?.();
    unsubscribeConnect = null;
    messageSub = null;
    errorSub = null;
    useWebSocketStore.getState().disconnect();
    set({ messages: null });
  },

  // Optimistic UI: hiển thị tin nhắn ngay, publish qua WS sau. Không có ack từ server nên
  // status "sending" chỉ được gỡ khi resolveIncomingMessage nhận lại tin nhắn thật.
  sendMessage: (conversationId, content) => {
    const message: Message = {
      id: `${TEMP_ID_PREFIX}${crypto.randomUUID()}`,
      conversationId,
      senderId: ownerAccountStore.getState().user.id ?? "",
      content,
      messageType: "TEXT",
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    get().appendMessage(message);
    publishMessage(message, get);
  },

  retryMessage: (messageId) => {
    const message = get().messages?.find((m) => m.id === messageId);
    if (!message) return;
    get().updateMessageStatus(messageId, "sending");
    publishMessage(message, get);
  },
}));

type Get = () => MessageStore;
type Set = (partial: Partial<MessageStore>) => void;

// Tin nhắn thật từ server thay thế tin nhắn optimistic cùng nội dung do chính mình gửi,
// tránh nhân đôi bubble khi server echo lại tin đã gửi. Bỏ qua nếu id đã có sẵn trong
// mảng (WS subscribe trùng do Fast Refresh/StrictMode, hoặc tin vừa fetch REST xong).
function resolveIncomingMessage(receivedMessage: Message, get: Get, set: Set) {
  const selfId = ownerAccountStore.getState().user.id;
  const messages = get().messages ?? [];

  if (messages.some((m) => m.id === receivedMessage.id)) return;

  const pendingIndex =
    receivedMessage.senderId === selfId
      ? messages.findIndex(
          (m) => m.id.startsWith(TEMP_ID_PREFIX) && m.content === receivedMessage.content,
        )
      : -1;

  if (pendingIndex === -1) {
    get().appendMessage(receivedMessage);
    return;
  }
  const next = [...messages];
  next[pendingIndex] = receivedMessage;
  set({ messages: next });
}

function publishMessage(message: Message, get: Get) {
  const { client } = useWebSocketStore.getState();
  if (!client?.connected) {
    console.warn("[WS] sendMessage skipped: client not connected");
    get().updateMessageStatus(message.id, "failed");
    return;
  }

  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({
      conversationId: message.conversationId,
      content: message.content,
      messageType: message.messageType,
    }),
  });
}
