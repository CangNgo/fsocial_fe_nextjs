"use client";

import { useMessageStore } from "@/shared/stores/message-store";
import type { Conversation } from "@/shared/types/message";
import { useEffect, useRef } from "react";
import { useMessages } from "./use-messages";

/**
 * Đồng bộ trang message từ React Query vào message-store và giữ scroll khi load trang cũ.
 * Chỉ được gọi ở đúng một nơi (message-thread-panel) để tránh sync trùng.
 */
export function useMessageThread(conversation: Conversation | null) {
  const messages = useMessageStore((state) => state.messages);
  const setMessages = useMessageStore((state) => state.setMessages);
  const prependMessages = useMessageStore((state) => state.prependMessages);

  // Draft conversation chưa tồn tại ở backend nên không fetch message cho nó.
  const conversationId = conversation && !conversation.isDraft ? conversation.id : undefined;
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useMessages(conversationId);

  const listRef = useRef<HTMLDivElement>(null);
  const loadedPageCountRef = useRef(0);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const prevScrollHeightRef = useRef<number | null>(null);

  // Reset con trỏ phân trang/scroll khi đổi conversation.
  useEffect(() => {
    loadedPageCountRef.current = 0;
    lastMessageIdRef.current = undefined;
  }, [conversationId]);

  useEffect(() => {
    if (!data) return;

    if (loadedPageCountRef.current === 0) {
      setMessages([...data.pages.flatMap((page) => page?.data ?? [])].reverse());
    } else if (data.pages.length > loadedPageCountRef.current) {
      const olderPage = data.pages[data.pages.length - 1];
      prependMessages([...(olderPage?.data ?? [])].reverse());
    }
    loadedPageCountRef.current = data.pages.length;
  }, [data, setMessages, prependMessages]);

  // Tin nhắn mới ở cuối -> cuộn xuống.
  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1];
    if (!lastMessage || lastMessage.id === lastMessageIdRef.current) return;
    lastMessageIdRef.current = lastMessage.id;
    listRef.current?.scroll({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Prepend trang cũ làm scrollHeight tăng -> bù scrollTop để giữ nguyên vị trí đang đọc.
  useEffect(() => {
    const el = listRef.current;
    const prevScrollHeight = prevScrollHeightRef.current;
    if (!el || prevScrollHeight === null) return;
    el.scrollTop = el.scrollHeight - prevScrollHeight;
    prevScrollHeightRef.current = null;
  }, [messages]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || el.scrollTop > 0 || !hasNextPage || isFetchingNextPage) return;
    prevScrollHeightRef.current = el.scrollHeight;
    fetchNextPage();
  };

  return {
    messages,
    listRef,
    handleScroll,
    isLoading: isLoading && Boolean(conversationId),
    isFetchingNextPage,
  };
}
