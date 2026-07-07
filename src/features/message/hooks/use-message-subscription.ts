"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { messageKeys } from "@/services/message/message.key";
import { regexInMessage } from "@/shared/config/regex";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { Conversation, Message } from "@/shared/types/message";

interface UseMessageSubscriptionOptions {
  conversations: Conversation[] | null;
}

export function useMessageSubscription({ conversations }: UseMessageSubscriptionOptions) {
  const pathname = usePathname();
  const { conversation, newMessage, setNewMessage } = useMessageStore();
  const queryClient = useQueryClient();
  const userId = ownerAccountStore((state) => state.user.id);

  const updateConversations = useCallback(
    (baseConversation: Partial<Conversation>) => {
      queryClient.setQueryData(
        messageKeys.conversations(userId ?? ""),
        (resp: { statusCode?: number; data?: Conversation[] } | null | undefined) => {
          if (!resp?.data) return resp;
          const existConversation = resp.data.find((conver) => conver.id === baseConversation.id);
          const nextData = existConversation
            ? [
                { ...existConversation, lastMessage: baseConversation.lastMessage },
                ...resp.data.filter((item) => item.id !== existConversation.id),
              ]
            : [baseConversation as Conversation, ...resp.data];
          return { ...resp, data: nextData };
        },
      );
    },
    [queryClient, userId],
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
