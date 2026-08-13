"use client";

import { useMessageStore } from "@/shared/stores/message-store";
import { useCallback, useState } from "react";

export function useSendMessage(conversationId: string | undefined) {
  const [content, setContent] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const sendMessage = useMessageStore((state) => state.sendMessage);

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || !conversationId) return;
    sendMessage(conversationId, trimmed);
    setContent("");
    setResetKey((key) => key + 1);
  }, [content, conversationId, sendMessage]);

  return { content, setContent, handleSend, resetKey };
}
