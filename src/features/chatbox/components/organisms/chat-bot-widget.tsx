"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChatBot } from "../../hooks/use-chat-bot";
import { ChatBotButton } from "../atoms/chat-bot-button";
import { ChatBotPanel } from "./chat-bot-panel";

export default function ChatBotWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  // Hội thoại sống ở đây nên đóng/mở panel không làm mất lịch sử.
  const { messages, isLoading, sendMessage, retry } = useChatBot();

  // Không huỷ lượt đang chờ: reply vẫn về qua WS, huỷ ở đây là mất câu trả lời.
  const close = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }
    setIsOpen(true);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      // Click trên nút nổi đã có toggle lo, bỏ qua để không đóng-rồi-mở.
      if (buttonRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest("[data-chatbot-panel]")) return;
      close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, close]);

  return (
    <div className="fixed right-4 bottom-[4.5rem] z-40 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {isOpen && (
        <ChatBotPanel
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onRetry={retry}
          onClose={close}
        />
      )}

      <ChatBotButton ref={buttonRef} isOpen={isOpen} onClick={toggle} />
    </div>
  );
}
