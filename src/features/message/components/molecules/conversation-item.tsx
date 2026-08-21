"use client";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { Conversation } from "@/shared/types/message";
import { formatDateSpaceTime } from "@/shared/utils/convert-date-time";
import { memo } from "react";
import { conversationDisplayName } from "../../utils/conversation-display";
import { ConversationAvatar } from "../atoms/conversation-avatar";

interface ConversationItemProps {
  conversation: Conversation;
  selfId?: string;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
}

function ConversationItemBase({
  conversation,
  selfId,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const { lastMessage, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;
  const userId = ownerAccountStore(state => state.user.id)

  const sender = userId === lastMessage?.senderId ? "Bạn" : lastMessage?.actorSnapshotDTO?.displayName

  return (
    <Button
      variant="outline"
      className={cn(
        "w-full text-left px-3 py-2.5 h-auto flex items-center gap-3 rounded-none border-0 hover:bg-gray-100 transition cursor-pointer",
        isSelected && "bg-gray-100",
      )}
      onClick={() => onSelect(conversation)}
    >
      <ConversationAvatar conversation={conversation} selfId={selfId} />

      <div className="grow min-w-0">
        <div className="flex justify-between">
          <span className={cn("font-medium max-w-[70%] overflow-clip", hasUnread && "font-bold")}>
            {conversationDisplayName(conversation, selfId)}
          </span>
          {lastMessage && (
            <span className="text-gray fs-xs text-nowrap">
              {formatDateSpaceTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        {lastMessage && (
          <div className="flex gap-2 items-end justify-between">
            <div
              className={cn("line-clamp-1 text-gray", hasUnread && "text-foreground font-medium")}
            >
              {`${sender}: ` + lastMessage.content}
            </div>
            {hasUnread && (
              <span className="shrink-0 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Button>
  );
}

export const ConversationItem = memo(ConversationItemBase);
