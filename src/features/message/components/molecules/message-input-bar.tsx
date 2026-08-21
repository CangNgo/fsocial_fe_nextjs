"use client";

import { Button } from "@/shared/components/ui/button";
import { Image as ImageIcon, SendHorizonal } from "lucide-react";
import { useEffect, useRef } from "react";
import { MessageComposer, type MessageComposerHandle } from "./message-composer";

interface MessageInputBarProps {
  // Đổi giá trị -> remount editor để xoá nội dung sau khi gửi.
  resetKey: number;
  // Đổi giá trị -> focus lại composer khi chuyển conversation.
  focusKey?: string;
  disabled?: boolean;
  onChange: (text: string) => void;
  onSend: () => void;
}

export function MessageInputBar({
  resetKey,
  focusKey,
  disabled,
  onChange,
  onSend,
}: MessageInputBarProps) {
  const composerRef = useRef<MessageComposerHandle>(null);

  useEffect(() => {
    composerRef.current?.focus();
  }, [focusKey]);

  return (
    <div className="px-4 py-3 border-t flex items-end gap-2 w-full">
      <ImageIcon size={30} className="shrink-0" />
      <MessageComposer
        ref={composerRef}
        resetKey={resetKey}
        onChange={onChange}
        onSend={onSend}
        placeholder="Nhắn tin..."
        className="grow min-w-0 max-h-52 overflow-y-auto"
      />
      <Button
        type="button"
        aria-label="Gửi tin nhắn"
        disabled={disabled}
        className="btn-transparent p-2 rounded-2xl w-10 shrink-0 bg-transparent"
        onClick={onSend}
      >
        <SendHorizonal size={30} />
      </Button>
    </div>
  );
}
