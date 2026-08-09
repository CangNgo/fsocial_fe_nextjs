"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { getMessages } from "@/services/message/message-api";
import { messageKeys } from "@/services/message/message.key";
import { useMessageStore } from "@/shared/stores/message-store";
import type { Conversation } from "@/shared/types/message";

interface UseChooseConversationOptions {
  contentActive: number;
  setContentActive: (contentActive: number) => void;
}

export function useChooseConversation({
  contentActive,
  setContentActive,
}: UseChooseConversationOptions) {
  const { setMessages, setActiveConversationId } = useMessageStore();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const query = useQuery({
    queryKey: messageKeys.thread(selectedConversation?.id ?? ""),
    queryFn: () => getMessages(selectedConversation?.id ?? ""),
    enabled: Boolean(selectedConversation?.id),
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  useEffect(() => {
    if (!selectedConversation || !query.data) return;
    setMessages([...query.data].reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only push fetched thread into the store when a fresh page of messages arrives
  }, [query.data, selectedConversation]);

  const handleChooseConversation = useCallback(
    (selectedConver: Conversation) => {
      if (selectedConversation?.id === selectedConver.id && contentActive === 2) {
        return;
      }

      setMessages(null);
      setContentActive(2);
      setSelectedConversation(selectedConver);
      setActiveConversationId(selectedConver.id);
    },
    [contentActive, selectedConversation, setContentActive, setMessages, setActiveConversationId],
  );

  const handleGoBack = useCallback(() => {
    setContentActive(0);
    setSelectedConversation(null);
    setActiveConversationId(null);
  }, [setContentActive, setActiveConversationId]);

  return { selectedConversation, handleChooseConversation, handleGoBack };
}
