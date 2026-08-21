"use client";

import { CHATBOT_AVATAR, CHATBOT_NAME } from "@/features/chatbox/constants/chatbot";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import { forwardRef } from "react";

interface ChatBotButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ChatBotButton = forwardRef<HTMLButtonElement, ChatBotButtonProps>(
  function ChatBotButton({ isOpen, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={isOpen ? "Đóng khung chat" : `Mở khung chat với ${CHATBOT_NAME}`}
        aria-expanded={isOpen}
        className={cn(
          "relative grid size-[60px] place-items-center rounded-full shadow-lg transition-transform",
          "hover:scale-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          isOpen && "bg-muted",
        )}
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <Image
            src={CHATBOT_AVATAR}
            alt=""
            width={60}
            height={60}
            className="size-[60px] rounded-full object-cover"
            priority
          />
        )}
      </button>
    );
  },
);
