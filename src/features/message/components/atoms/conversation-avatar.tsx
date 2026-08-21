"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import type { Conversation } from "@/shared/types/message";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { conversationAvatar, conversationDisplayName } from "../../utils/conversation-display";

interface ConversationAvatarProps {
  conversation: Conversation;
  selfId?: string;
  className?: string;
}

export function ConversationAvatar({ conversation, selfId, className }: ConversationAvatarProps) {
  const isOnline = conversation.type === "DIRECT" && conversation.online;

  return (
    <div className="relative shrink-0">
      <Avatar className={cn("size-11", className)}>
        <AvatarImage src={conversationAvatar(conversation, selfId)} />
        <AvatarFallback className="fs-xs">
          {getInitialsFromDisplayName(conversationDisplayName(conversation, selfId))}
        </AvatarFallback>
      </Avatar>
      {isOnline && (
        <span className="absolute bottom-0 right-0 size-4 rounded-full bg-green-500 border-2 border-background" />
      )}
    </div>
  );
}
