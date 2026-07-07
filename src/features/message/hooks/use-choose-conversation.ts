"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { messageKeys } from "@/services/message/message.key";
import { getMessages } from "@/services/message/message-api";
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
  const { setMessages, conversation, setConversation, setSubscription } = useMessageStore();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: messageKeys.thread(selectedConversationId ?? ""),
    queryFn: () => getMessages(selectedConversationId ?? ""),
    enabled: Boolean(selectedConversationId),
    select: (resp) => (resp?.statusCode === 200 ? (resp.data?.listMessages ?? []) : []),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: only push fetched thread into the store when a fresh page of messages arrives
  useEffect(() => {
    if (!selectedConversationId || !query.data) return;
    setMessages([...query.data].reverse());
  }, [query.data, selectedConversationId]);

  const handleChooseConversation = useCallback(
    (selectedConver: Conversation) => {
      if (conversation && conversation.id === selectedConver.id && contentActive === 2) {
        return;
      }

      setMessages(null);
      setContentActive(2);
      if (selectedConver.lastMessage) selectedConver.lastMessage.read = true;
      setConversation(selectedConver as Parameters<typeof setConversation>[0]);
      setSubscription(selectedConver.id);
      setSelectedConversationId(selectedConver.id);
    },
    [contentActive, conversation, setContentActive, setConversation, setMessages, setSubscription],
  );

  const handleGoBack = useCallback(() => {
    setContentActive(0);
    setConversation(null);
    setSelectedConversationId(null);
  }, [setContentActive, setConversation]);

  return { handleChooseConversation, handleGoBack };
}
