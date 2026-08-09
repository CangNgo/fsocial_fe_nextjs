"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ApiResponse } from "@/shared/types/api-response";
import { messageKeys } from "@/services/message/message.key";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { Conversation } from "@/shared/types/message";

export function useMessageSubscription() {
  const incomingMessage = useMessageStore((state) => state.incomingMessage);
  const setIncomingMessage = useMessageStore((state) => state.setIncomingMessage);
  const queryClient = useQueryClient();
  const userId = ownerAccountStore((state) => state.user.id);

  useEffect(() => {
    if (!incomingMessage) return;

    queryClient.setQueryData(
      messageKeys.conversations(userId ?? ""),
      (resp: ApiResponse<Conversation[]> | null | undefined) => {
        if (!resp?.data) return resp;
        const existing = resp.data.find((conver) => conver.id === incomingMessage.conversationId);
        if (!existing) return resp;
        const updated = { ...existing, lastMessage: incomingMessage };
        return { ...resp, data: [updated, ...resp.data.filter((conver) => conver.id !== existing.id)] };
      },
    );
    setIncomingMessage(null);
  }, [incomingMessage, queryClient, userId, setIncomingMessage]);
}
