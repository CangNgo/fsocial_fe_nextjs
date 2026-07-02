"use client";

import { usePathname } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect } from "react";
import { regexInMessage } from "@/shared/config/regex";
import { useMessageStore } from "@/shared/stores/message-store";
import type { Conversation, Message } from "../types/conversation";

interface UseMessageSubscriptionOptions {
  conversations: Conversation[] | null;
  setConversations: Dispatch<SetStateAction<Conversation[] | null>>;
}

export function useMessageSubscription({
  conversations,
  setConversations,
}: UseMessageSubscriptionOptions) {
  const pathname = usePathname();
  const { conversation, newMessage, setNewMessage } = useMessageStore();

  const updateConversations = useCallback(
    (baseConversation: Partial<Conversation>) => {
      setConversations((prevConversations) => {
        if (!prevConversations) return prevConversations;
        const existConversation = prevConversations.find(
          (conver) => conver.id === baseConversation.id,
        );
        if (existConversation) {
          const updated = { ...existConversation, lastMessage: baseConversation.lastMessage };
          return [updated, ...prevConversations.filter((item) => item.id !== existConversation.id)];
        }
        return [baseConversation as Conversation, ...prevConversations];
      });
    },
    [setConversations],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: excludes `conversations` — it changes inside this effect via updateConversations and would retrigger it
  useEffect(() => {
    if (!newMessage || !conversation || !conversations) return;

    const receivedMessage: Message = { ...newMessage };
    if (receivedMessage.conversationId === conversation.id && regexInMessage.test(pathname)) {
      receivedMessage.read = true;
    }

    updateConversations({
      id: receivedMessage.conversationId,
      lastMessage: {
        content: receivedMessage.content,
        read: receivedMessage.read ?? false,
        createAt: receivedMessage.createAt,
      },
    });
    setNewMessage(null);
  }, [newMessage, pathname, updateConversations, setNewMessage, conversation]);
}
