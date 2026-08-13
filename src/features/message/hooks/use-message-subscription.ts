"use client";

import { useEffect } from "react";
import { useMessageStore } from "@/shared/stores/message-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";

export function useMessageSubscription() {
  const incomingMessage = useMessageStore((state) => state.incomingMessage);
  const setIncomingMessage = useMessageStore((state) => state.setIncomingMessage);
  const applyIncomingMessage = useConversationStore((state) => state.applyIncomingMessage);

  useEffect(() => {
    if (!incomingMessage) return;
    applyIncomingMessage(incomingMessage);
    setIncomingMessage(null);
  }, [incomingMessage, applyIncomingMessage, setIncomingMessage]);
}
