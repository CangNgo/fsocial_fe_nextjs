"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getConversations } from "@/services/message/message-api";
import { messageKeys } from "@/services/message/message.key";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export function useConversations() {
  const userId = ownerAccountStore((state) => state.user.id);
  const [contentActive, setContentActive] = useState(0);

  const query = useQuery({
    queryKey: messageKeys.conversations(userId ?? ""),
    queryFn: () => getConversations(),
    enabled: Boolean(userId),
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  const conversations = query.data ?? null;

  const handleOpenCreateConversation = useCallback(() => {
    setContentActive(1);
  }, [setContentActive]);

  return {
    contentActive,
    setContentActive,
    conversations,
    handleOpenCreateConversation,
  };
}
