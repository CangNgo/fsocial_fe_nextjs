"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Conversation } from "@/shared/types/message";
import { formatDateSpaceTime } from "@/shared/utils/convert-date-time";
import { conversationDisplayName } from "../../utils/conversation-display";

interface ConversationItemProps {
  userId?: string;
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationItem({ userId, conversation, isSelected, onSelect }: ConversationItemProps) {
  return (
    <Button
      variant={"outline"}
      className={cn(
        "w-full text-left px-3 py-2.5 h-auto flex items-center gap-3 rounded-none border-0 hover:bg-gray-100 transition cursor-pointer",
        isSelected && "bg-gray-100",
      )}
      onClick={() => onSelect(conversation)}
    >
      <div className="relative shrink-0">
        <Avatar className="size-11">
          <AvatarImage src={conversation.avatarUrl} />
          <AvatarFallback className="fs-xs">
            {conversation.name}
          </AvatarFallback>
        </Avatar>
        {conversation.type === "DIRECT" && conversation.online && (
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      <div className="grow min-w-0">
        <div className="flex justify-between">
          <span className={cn("font-medium max-w-[70%] overflow-clip", conversation.unreadCount > 0 && "font-bold")}>
            {conversationDisplayName(conversation, userId)}
          </span>
          {conversation.lastMessage &&
            <span className="text-gray fs-xs text-nowrap">
              {formatDateSpaceTime(conversation.lastMessage.createdAt)}
            </span>
          }
        </div>
        {conversation.lastMessage && (
          <div className="flex gap-2 items-end justify-between">
            <div
              className={cn(
                "line-clamp-1 text-gray",
                conversation.unreadCount > 0 && "text-foreground font-medium",
              )}
            >
              {conversation.lastMessage.content}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {conversation.unreadCount > 0 && (
                <span className="min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Button>
  );
}
