"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import type { Message } from "@/shared/types/message";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { RotateCcw } from "lucide-react";
import { memo } from "react";

interface MessageThreadProps {
  messages: Message[] | null;
  selfId?: string;
}

interface MessageBubbleProps {
  message: Message;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  onRetry: (messageId: string) => void;
}

function SelfMessage({ message, onRetry }: Pick<MessageBubbleProps, "message" | "onRetry">) {
  return (
    <div className="flex items-center gap-2 self-end max-w-[70%]">
      {message.status === "failed" && (
        <button
          type="button"
          onClick={() => onRetry(message.id)}
          className="text-destructive shrink-0"
          aria-label="Gửi lại tin nhắn"
        >
          <RotateCcw size={16} />
        </button>
      )}
      <div
        className={cn(
          "px-3 py-2 rounded-2xl break-words bg-primary-gradient text-white",
          message.status && "opacity-60",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

function PartnerMessage({
  message,
  isFirstInGroup,
  isLastInGroup,
}: Omit<MessageBubbleProps, "onRetry">) {
  const actor = message.actorSnapshotDTO;

  return (
    <div className="flex items-end gap-2 justify-start max-w-[70%] self-start">
      {isLastInGroup ? (
        <Avatar className="size-7 shrink-0">
          <AvatarImage src={actor?.avatar} />
          <AvatarFallback>{getInitialsFromDisplayName(actor?.displayName ?? "")}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="size-7 shrink-0" />
      )}
      <div className="flex flex-col gap-1 min-w-0">
        {isFirstInGroup && actor?.displayName && (
          <span className="text-xs text-muted-foreground px-1">{actor.displayName}</span>
        )}
        <div className="px-3 py-2 rounded-2xl break-words bg-gray-2light">{message.content}</div>
      </div>
    </div>
  );
}

function MessageThreadBase({ messages, selfId }: MessageThreadProps) {
  const retryMessage = useMessageStore((state) => state.retryMessage);

  if (!messages) return null;

  if (messages.length === 0) {
    return (
      <p className="m-auto text-gray text-center">Chưa có tin nhắn nào, gửi lời chào trước nhé</p>
    );
  }

  return (
    <>
      {messages.map((message, index) => {
        if (message.senderId === selfId) {
          return <SelfMessage key={message.id} message={message} onRetry={retryMessage} />;
        }
        return (
          <PartnerMessage
            key={message.id}
            message={message}
            isFirstInGroup={index === 0 || messages[index - 1].senderId !== message.senderId}
            isLastInGroup={
              index === messages.length - 1 || messages[index + 1].senderId !== message.senderId
            }
          />
        );
      })}
    </>
  );
}

export const MessageThread = memo(MessageThreadBase);
