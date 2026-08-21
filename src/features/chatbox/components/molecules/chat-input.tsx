"use client";

import {
  CHATBOT_COUNTER_THRESHOLD,
  CHATBOT_MAX_PROMPT,
} from "@/features/chatbox/constants/chatbot";
import { Textarea } from "@/shared/components/ui/textarea";
import { SendHorizontal } from "lucide-react";
import { forwardRef, useState, type KeyboardEvent } from "react";

interface ChatInputProps {
  disabled: boolean;
  onSend: (prompt: string) => void;
}

export const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(function ChatInput(
  { disabled, onSend },
  ref,
) {
  const [value, setValue] = useState("");

  const trimmed = value.trim();
  const canSend = Boolean(trimmed) && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: đang gõ tiếng Việt bằng IME, Enter là để chọn từ chứ không phải gửi.
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  };

  return (
    <div className="flex w-full shrink-0 flex-col gap-1 border-t px-3 py-2.5">
      <div className="flex items-end gap-2">
        <Textarea
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          maxLength={CHATBOT_MAX_PROMPT}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          aria-label="Nhập câu hỏi cho Flowzone"
          className="scrollable-div max-h-24 min-h-9 resize-none py-2 text-sm"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Gửi câu hỏi"
          className="grid size-9 shrink-0 place-items-center rounded-full text-primary transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <SendHorizontal className="size-4" />
        </button>
      </div>

      {value.length > CHATBOT_COUNTER_THRESHOLD && (
        <span className="self-end text-[10px] text-muted-foreground">
          {value.length}/{CHATBOT_MAX_PROMPT}
        </span>
      )}
    </div>
  );
});
