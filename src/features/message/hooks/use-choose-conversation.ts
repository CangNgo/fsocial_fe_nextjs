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
  const {
    activeConversation,
    setActiveConversation,
    clearActiveConversation,
    resetConversationUnread
  }
    = useConversationStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(
    activeConversation?.id,
  );

  const loadedPageCountRef = useRef(0);

  useEffect(() => {
    if (!activeConversation || !data) return;

    if (loadedPageCountRef.current === 0) {
      const items = data.pages.flatMap((page) => page?.data ?? []);
      setMessages([...items].reverse());
    } else if (data.pages.length > loadedPageCountRef.current) {
      const olderPage = data.pages[data.pages.length - 1];
      prependMessages([...(olderPage?.data ?? [])].reverse());
    }
    loadedPageCountRef.current = data.pages.length;
  }, [data, activeConversation, setMessages, prependMessages]);

  const handleChooseConversation = useCallback(
    (selectedConver: Conversation) => {
      if (activeConversation?.id === selectedConver.id && contentActive === 2) {
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
      activeConversation,
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
    activeConversation,
    handleChooseConversation,
    handleGoBack,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
