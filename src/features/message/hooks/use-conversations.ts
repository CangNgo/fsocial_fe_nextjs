"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { messageKeys } from "@/services/message/message.key";
import { getConversations } from "@/services/message/message-api";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export function useConversations() {
  const user = ownerAccountStore((state) => state.user);
  const { conversation, setNewMessage } = useMessageStore();

  const [contentActive, setContentActive] = useState(0);

  const query = useQuery({
    queryKey: messageKeys.conversations(user.id ?? ""),
    queryFn: () => getConversations(user.id ?? ""),
    enabled: Boolean(user.id),
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  const conversations = query.data ?? null;

  const handleOpenCreateConversation = useCallback(() => {
    setContentActive(1);
  }, [setContentActive]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the logged-in user changes, not on every conversation update
  useEffect(() => {
    if (!user.id) return;
    queueMicrotask(() => {
      if (conversation) setContentActive(2);
      setNewMessage(null);
    });
  }, [user.id]);

  return {
    contentActive,
    setContentActive,
    conversations,
    handleOpenCreateConversation,
  };
}
