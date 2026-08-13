"use client";

import { useMessageStore } from "@/shared/stores/message-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import type { Conversation } from "@/shared/types/message";
import { useCallback, useEffect, useRef } from "react";
import { useMessages } from "./use-messages";

interface UseChooseConversationOptions {
  contentActive: number;
  setContentActive: (contentActive: number) => void;
}

export function useChooseConversation({
  contentActive,
  setContentActive,
}: UseChooseConversationOptions) {
  const { setMessages, prependMessages, setActiveConversationId } = useMessageStore();
  const selectedConversation = useConversationStore((state) => state.activeConversation);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const clearActiveConversation = useConversationStore((state) => state.clearActiveConversation);
  const resetConversationUnread = useConversationStore((state) => state.resetConversationUnread);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(
    selectedConversation?.id,
  );

  const loadedPageCountRef = useRef(0);

  // Trang đầu (đổi conversation, loadedPageCountRef reset về 0 ở handleChooseConversation)
  // -> reset toàn bộ messages. Các trang sau (fetchNextPage, tức load tin cũ hơn khi scroll up)
  // -> chỉ nối thêm trang mới vào đầu, không đụng tin nhắn realtime/optimistic đang có trong
  // store (chúng không nằm trong cache react-query).
  useEffect(() => {
    if (!selectedConversation || !data) return;

    if (loadedPageCountRef.current === 0) {
      const items = data.pages.flatMap((page) => page?.data ?? []);
      setMessages([...items].reverse());
    } else if (data.pages.length > loadedPageCountRef.current) {
      const olderPage = data.pages[data.pages.length - 1];
      prependMessages([...(olderPage?.data ?? [])].reverse());
    }
    loadedPageCountRef.current = data.pages.length;
  }, [data, selectedConversation, setMessages, prependMessages]);

  const handleChooseConversation = useCallback(
    (selectedConver: Conversation) => {
      if (selectedConversation?.id === selectedConver.id && contentActive === 2) {
        return;
      }

      loadedPageCountRef.current = 0;
      setMessages(null);
      setContentActive(2);
      setActiveConversation(selectedConver);
      setActiveConversationId(selectedConver.id);
      resetConversationUnread(selectedConver.id);
    },
    [
      contentActive,
      selectedConversation,
      setContentActive,
      setMessages,
      setActiveConversation,
      setActiveConversationId,
      resetConversationUnread,
    ],
  );

  const handleGoBack = useCallback(() => {
    setContentActive(0);
    clearActiveConversation();
    setActiveConversationId(null);
  }, [setContentActive, clearActiveConversation, setActiveConversationId]);

  return {
    selectedConversation,
    handleChooseConversation,
    handleGoBack,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
