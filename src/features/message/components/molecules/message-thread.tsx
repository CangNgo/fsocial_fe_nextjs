"use client";

import { cn } from "@/shared/lib/utils";
import type { Message } from "@/shared/types/message";

interface MessageThreadProps {
  messages: Message[] | null;
  selfId?: string;
}

export function MessageThread({ messages, selfId }: MessageThreadProps) {
  if (!messages) return null;

  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "max-w-[70%] px-3 py-2 rounded-2xl break-words",
            message.senderId === selfId
              ? "self-end bg-primary-gradient text-white"
              : "self-start bg-gray-2light",
          )}
        >
          {message.content}
        </div>
      ))}
    </>
  );
}
