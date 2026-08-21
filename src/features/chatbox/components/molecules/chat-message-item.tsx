import { CHATBOT_AVATAR } from "@/features/chatbox/constants/chatbot";
import { cn } from "@/shared/lib/utils";
import type { ChatMessage } from "@/shared/types/chatbot";
import Image from "next/image";

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry: (prompt: string) => void;
}

export function ChatMessageItem({ message, onRetry }: ChatMessageItemProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const { failedPrompt } = message;

  return (
    <div className={cn("flex max-w-[85%] items-end gap-2", isUser ? "self-end" : "self-start")}>
      {!isUser && (
        <Image
          src={CHATBOT_AVATAR}
          alt=""
          width={28}
          height={28}
          className="size-7 shrink-0 rounded-full object-cover"
        />
      )}

      <div className="flex min-w-0 flex-col gap-0.5">
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm",
            // ponytail: plain text — nâng lên react-markdown khi API thật sự trả markdown.
            "whitespace-pre-wrap break-words",
            isUser && "rounded-br-sm bg-primary text-primary-foreground",
            !isUser && !isError && "rounded-bl-sm bg-muted",
            isError &&
              "rounded-bl-sm border border-destructive/20 bg-destructive/10 text-destructive",
          )}
        >
          {message.content}

          {isError && failedPrompt && (
            <button
              type="button"
              onClick={() => onRetry(failedPrompt)}
              className="mt-1.5 block text-xs font-medium underline underline-offset-2 hover:opacity-80"
            >
              Thử lại
            </button>
          )}
        </div>

        <time
          dateTime={new Date(message.createdAt).toISOString()}
          className={cn("px-1 text-[10px] text-muted-foreground", isUser && "self-end")}
        >
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  );
}
