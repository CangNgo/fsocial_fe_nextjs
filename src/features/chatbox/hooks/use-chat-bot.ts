"use client";

import { useWebSocketStore } from "@/shared/stores/websocket-store";
import type { AiChatReply, ChatMessage } from "@/shared/types/chatbot";
import type { StompSubscription } from "@stomp/stompjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AI_QUEUE,
  AI_SEND_DESTINATION,
  CHATBOT_ERROR_TEXT,
  CHATBOT_WELCOME,
} from "../constants/chatbot";

/** WS không có ack — nếu server im lặng thì phải tự bỏ cuộc, nếu không typing indicator quay mãi. */
const AI_REPLY_TIMEOUT_MS = 30_000;

const createMessage = (message: Omit<ChatMessage, "id" | "createdAt">): ChatMessage => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  ...message,
});

const buildWelcome = (): ChatMessage[] => [
  createMessage({ role: "bot", content: CHATBOT_WELCOME, status: "sent" }),
];

export function useChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>(buildWelcome);
  const [isLoading, setIsLoading] = useState(false);

  /** requestId của câu hỏi đang chờ — reply mang id khác là của lượt cũ, bỏ qua. */
  const pendingRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const promptRef = useRef("");

  const clearPending = useCallback(() => {
    pendingRef.current = null;
    promptRef.current = "";
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsLoading(false);
  }, []);

  const pushError = useCallback(
    (failedPrompt: string) => {
      setMessages((prev) => [
        ...prev,
        createMessage({
          role: "bot",
          content: CHATBOT_ERROR_TEXT,
          status: "error",
          failedPrompt,
        }),
      ]);
      clearPending();
    },
    [clearPending],
  );

  useEffect(() => {
    const { connect, onConnect } = useWebSocketStore.getState();
    const client = connect();
    let subscription: StompSubscription | null = null;

    const handleReply = (body: string) => {
      const reply = JSON.parse(body) as AiChatReply;
      if (!pendingRef.current || reply.requestId !== pendingRef.current) return;

      if (!reply.success || !reply.content?.trim()) {
        pushError(promptRef.current);
        return;
      }
      setMessages((prev) => [
        ...prev,
        createMessage({ role: "bot", content: reply.content, status: "sent" }),
      ]);
      clearPending();
    };

    const subscribe = () => {
      // Reconnect chạy lại handler trên cùng client — huỷ sub cũ để không cộng dồn.
      subscription?.unsubscribe();
      subscription = client.subscribe(AI_QUEUE, (frame) => handleReply(frame.body));
    };

    // onConnect chỉ bắn lúc (re)connect. Layout đã kết nối trước khi widget mount nên
    // phải tự subscribe ngay cho phiên đang mở.
    if (client.connected) subscribe();
    const offConnect = onConnect(subscribe);

    return () => {
      offConnect();
      subscription?.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [clearPending, pushError]);

  const sendMessage = useCallback(
    (rawPrompt: string) => {
      const prompt = rawPrompt.trim();
      if (!prompt || pendingRef.current) return;

      setMessages((prev) => [
        ...prev,
        createMessage({ role: "user", content: prompt, status: "sent" }),
      ]);

      const client = useWebSocketStore.getState().client;
      if (!client?.connected) {
        pushError(prompt);
        return;
      }

      const requestId = crypto.randomUUID();
      pendingRef.current = requestId;
      promptRef.current = prompt;
      setIsLoading(true);

      timeoutRef.current = setTimeout(() => pushError(prompt), AI_REPLY_TIMEOUT_MS);

      client.publish({
        destination: AI_SEND_DESTINATION,
        body: JSON.stringify({ requestId, prompt }),
      });
    },
    [pushError],
  );

  /** Xoá cặp (user prompt + error bubble) ở cuối rồi gửi lại đúng prompt đó. */
  const retry = useCallback(
    (prompt: string) => {
      setMessages((prev) => {
        const next = [...prev];
        if (next.at(-1)?.status === "error") next.pop();
        if (next.at(-1)?.role === "user") next.pop();
        return next;
      });
      sendMessage(prompt);
    },
    [sendMessage],
  );

  return { messages, isLoading, sendMessage, retry };
}
