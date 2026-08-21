"use client";

import {
  CHATBOT_AVATAR,
  CHATBOT_NAME,
  CHATBOT_STATUS_TEXT,
} from "@/features/chatbox/constants/chatbot";
import type { ChatMessage } from "@/shared/types/chatbot";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { ChatInput } from "../molecules/chat-input";
import { ChatMessageList } from "../molecules/chat-message-list";

const FOCUSABLE =
  'button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

interface ChatBotPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (prompt: string) => void;
  onRetry: (prompt: string) => void;
  onClose: () => void;
}

export function ChatBotPanel({ messages, isLoading, onSend, onRetry, onClose }: ChatBotPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Trả focus về textarea sau khi gửi xong để gõ tiếp không cần click.
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;

    const nodes = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
    if (!nodes?.length) return;

    const first = nodes[0];
    const last = nodes[nodes.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      // Không chặn tương tác với trang phía sau nên không phải modal thật.
      aria-modal="false"
      aria-label={`Khung chat với ${CHATBOT_NAME}`}
      onKeyDown={handleKeyDown}
      data-chatbot-panel
      className="flex h-[70vh] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl duration-200 animate-in fade-in-0 slide-in-from-bottom-4 sm:h-[560px] sm:max-h-[calc(100vh-120px)] sm:w-[380px]"
    >
      <header className="flex shrink-0 items-center gap-2.5 border-b px-4 py-3">
        <Image
          src={CHATBOT_AVATAR}
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-full object-cover"
        />

        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold leading-tight">{CHATBOT_NAME}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-green-500" aria-hidden />
            {CHATBOT_STATUS_TEXT}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng khung chat"
          className="ml-auto grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </header>

      <ChatMessageList messages={messages} isLoading={isLoading} onRetry={onRetry} />

      <ChatInput ref={inputRef} disabled={isLoading} onSend={onSend} />
    </div>
  );
}
