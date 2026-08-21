"use client";

import type { Conversation } from "@/shared/types/message";
import { conversationDisplayName } from "../../utils/conversation-display";
import { ConversationAvatar } from "../atoms/conversation-avatar";

interface MessageThreadHeaderProps {
  conversation: Conversation;
  selfId?: string;
}

export function MessageThreadHeader({ conversation, selfId }: MessageThreadHeaderProps) {
  return (
    <div className="px-4 py-3 border-b flex items-center gap-3">
      <ConversationAvatar conversation={conversation} selfId={selfId} />
      <span className="font-semibold truncate">
        {conversationDisplayName(conversation, selfId)}
      </span>
    </div>
  );
}
