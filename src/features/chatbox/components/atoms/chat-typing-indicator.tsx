import { CHATBOT_AVATAR, CHATBOT_NAME } from "@/features/chatbox/constants/chatbot";
import Image from "next/image";

const DOT_DELAYS = ["0ms", "150ms", "300ms"] as const;

export function ChatTypingIndicator() {
  return (
    <div className="flex items-end gap-2 self-start">
      <Image
        src={CHATBOT_AVATAR}
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-full object-cover"
      />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3 py-3"
        aria-label={`${CHATBOT_NAME} đang trả lời`}
      >
        {DOT_DELAYS.map((delay) => (
          <span
            key={delay}
            className="size-1.5 rounded-full bg-muted-foreground"
            style={{ animation: "chat-bounce 1.2s ease-in-out infinite", animationDelay: delay }}
          />
        ))}
      </div>
    </div>
  );
}
