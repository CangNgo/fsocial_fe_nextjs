"use client";

import { useCallback, useRef, useState } from "react";
import { useMessageStore } from "@/shared/stores/message-store";
import { getMessages } from "../api/message-api";
import type { Conversation, MessagesResponse } from "../types/conversation";

interface UseChooseConversationOptions {
  contentActive: number;
  setContentActive: (contentActive: number) => void;
}

export function useChooseConversation({ contentActive, setContentActive }: UseChooseConversationOptions) {
  const { setMessages, conversation, setConversation, setSubscription } = useMessageStore();
  const [trigger, setTrigger] = useState(true);
  const controllerGetmsgs = useRef<AbortController | null>(null);

  const handleChooseConversation = useCallback(
    async (selectedConver: Conversation) => {
      if (conversation && conversation.id === selectedConver.id && contentActive === 2) {
        return;
      }

      setMessages(null);
      setContentActive(2);
      setTrigger((prev) => !prev);
      if (selectedConver.lastMessage) selectedConver.lastMessage.read = true;
      setConversation(selectedConver as Parameters<typeof setConversation>[0]);
      setSubscription(selectedConver.id);

      if (controllerGetmsgs.current) controllerGetmsgs.current.abort();
      controllerGetmsgs.current = new AbortController();

      const resp = (await getMessages(
        selectedConver.id,
        controllerGetmsgs.current.signal,
      )) as MessagesResponse | null;

      if (!resp || resp.statusCode !== 200) return;
      setMessages([...(resp.data?.listMessages ?? [])].reverse());
    },
    [contentActive, conversation, setContentActive, setConversation, setMessages, setSubscription],
  );

  const handleGoBack = useCallback(() => {
    setContentActive(0);
    setConversation(null);
  }, [setContentActive, setConversation]);

  return { trigger, handleChooseConversation, handleGoBack };
}
