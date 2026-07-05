"use client";

import { useCallback, useEffect, useState } from "react";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { getConversations } from "../api/message-api";
import type { Conversation, ConversationsResponse } from "../types/conversation";

export function useConversations() {
  const user = ownerAccountStore((state) => state.user);
  const { conversation, setNewMessage } = useMessageStore();

  const [contentActive, setContentActive] = useState(0);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);

  const handleOpenCreateConversation = useCallback(() => {
    setContentActive(1);
  }, []);

  const handleGetAllConversation = useCallback(async () => {
    const resp = (await getConversations()) as ConversationsResponse | null;
    if (resp?.statusCode !== 200) return;
    setConversations(resp.data ?? []);
    if (conversation) setContentActive(2);
  }, [conversation]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the logged-in user changes, not on every conversation update
  useEffect(() => {
    if (!user.id) return;
    queueMicrotask(() => {
      handleGetAllConversation();
      setNewMessage(null);
    });
  }, [user.id]);

  return {
    contentActive,
    setContentActive,
    conversations,
    setConversations,
    handleOpenCreateConversation,
  };
}
