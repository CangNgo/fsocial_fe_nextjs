"use client";

import { useCallback, useState } from "react";
import { useMessageStore } from "@/shared/stores/message-store";

export function useSendMessage(conversationId: string | undefined) {
  const [content, setContent] = useState("");
  const sendMessage = useMessageStore((state) => state.sendMessage);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || !conversationId) return;
    sendMessage(conversationId, trimmed);
    setContent("");
  }, [content, conversationId, sendMessage]);

  return { content, setContent, handleSend };
}
