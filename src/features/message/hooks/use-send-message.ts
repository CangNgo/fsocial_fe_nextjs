"use client";

import { useMessageStore } from "@/shared/stores/message-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import type { Conversation } from "@/shared/types/message";
import { useCallback, useRef, useState } from "react";
import { useCreateConversation } from "./use-create-conversation";

export function useSendMessage(activeConversation: Conversation | null) {
  const contentRef = useRef("");
  const [resetKey, setResetKey] = useState(0);
  const sendMessage = useMessageStore((state) => state.sendMessage);
  const removeConversation = useConversationStore((state) => state.removeConversation);
  const setActiveConversation = useConversationStore((state) => state.setActiveConversation);
  const createConversation = useCreateConversation();

  const setContent = useCallback((value: string) => {
    contentRef.current = value;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = contentRef.current.trim();
    if (!trimmed || !activeConversation || createConversation.isPending) return;

    contentRef.current = "";
    setResetKey((key) => key + 1);

    if (!activeConversation.isDraft) {
      sendMessage(activeConversation.id, trimmed);
      return;
    }

    // Draft: tạo conversation thật trước, thay draft bằng conversation thật trong list rồi mới gửi.
    const partnerId = activeConversation.members[0]?.userId;
    if (!partnerId) return;

    const draftId = activeConversation.id;
    createConversation.mutate(partnerId, {
      onSuccess: (resp) => {
        if (resp?.statusCode !== 200 || !resp.data) return;
        removeConversation(draftId);
        setActiveConversation(resp.data.id);
        sendMessage(resp.data.id, trimmed);
      },
    });
  }, [activeConversation, createConversation, sendMessage, removeConversation, setActiveConversation]);

  return { setContent, handleSend, resetKey, isCreating: createConversation.isPending };
}
