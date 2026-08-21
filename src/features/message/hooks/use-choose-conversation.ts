"use client";

import { useMessageStore } from "@/shared/stores/message-store";
import {
  selectActiveConversation,
  useConversationStore,
} from "@/shared/stores/use-conversation-store";
import type { Conversation } from "@/shared/types/message";
import { useCallback } from "react";

/**
 * Chọn conversation. Hook này cố ý KHÔNG fetch message — nó được dùng ở cả list và
 * search box, fetch/sync thread nằm riêng ở useMessageThread để chỉ chạy một lần.
 */
export function useChooseConversation() {
  const setMessages = useMessageStore((state) => state.setMessages);

  const activeConversationId = useConversationStore((state) => state.activeConversationId);
  const isThreadOpen = useConversationStore((state) => state.isThreadOpen);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const setThreadOpen = useConversationStore((state) => state.setThreadOpen);
  const resetConversationUnread = useConversationStore((state) => state.resetConversationUnread);
  const removeDraftConversations = useConversationStore((state) => state.removeDraftConversations);

  const handleChooseConversation = useCallback(
    (selected: Conversation) => {
      if (activeConversationId === selected.id && isThreadOpen) return;

      setMessages(null);
      setThreadOpen(true);
      // Rời draft chưa gửi sang conversation khác thì dọn draft, tránh tồn đọng trong list.
      if (!selected.isDraft) removeDraftConversations();
      setActiveConversation(selected.id);
      resetConversationUnread(selected.id);
    },
    [
      activeConversationId,
      isThreadOpen,
      setMessages,
      setThreadOpen,
      setActiveConversation,
      resetConversationUnread,
      removeDraftConversations,
    ],
  );

  return { activeConversationId, handleChooseConversation };
}

export function useActiveConversation() {
  return useConversationStore(selectActiveConversation);
}
