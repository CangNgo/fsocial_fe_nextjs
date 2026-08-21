"use client";

import type { ChatMessage } from "@/shared/types/chatbot";
import { useEffect, useRef } from "react";
import { ChatTypingIndicator } from "../atoms/chat-typing-indicator";
import { ChatMessageItem } from "./chat-message-item";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onRetry: (prompt: string) => void;
}

export function ChatMessageList({ messages, isLoading, onRetry }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="scrollable-div flex min-h-0 grow flex-col gap-3 overflow-y-auto p-4"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} onRetry={onRetry} />
      ))}

      {isLoading && <ChatTypingIndicator />}
    </div>
  );
}
