"use client";

import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { useEffect } from "react";

export function useConversations() {
  const userId = ownerAccountStore((state) => state.user.id);
  const contentActive = useConversationStore((state) => state.contentActive);
  const setContentActive = useConversationStore((state) => state.setContentActive);
  const conversations = useConversationStore((state) => state.conversations);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);

  useEffect(() => {
    if (!userId) return;
    fetchConversations();
  }, [userId, fetchConversations]);

  return {
    contentActive,
    setContentActive,
    conversations,
  };
}
