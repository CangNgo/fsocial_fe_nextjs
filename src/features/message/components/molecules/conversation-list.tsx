"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Conversation } from "@/shared/types/message";
import { Virtuoso } from "react-virtuoso";
import { ConversationItem } from "./conversation-item";

interface ConversationListProps {
  userId?: string;
  conversations: Conversation[] | [];
  selectedConversationId?: string;
  isLoading: boolean;
  onSelect: (conversation: Conversation) => void;
}

export function ConversationList({
  userId,
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="h-full grow overflow-auto">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="px-3 py-2.5 h-16 flex items-center gap-3">
            <Skeleton className="size-11 rounded-full" />
            <div className="grow space-y-2">
              <Skeleton className="w-1/2 h-4 rounded-sm" />
              <Skeleton className="h-4 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return <p className="px-3 py-2.5">Bắt đầu tạo cuộc trò chuyện mới nào</p>;
  }

  return (
    <Virtuoso
      className="h-full grow"
      data={conversations}
      computeItemKey={(_, conver) => conver.id}
      itemContent={(_, conver) => (
        <ConversationItem
          userId={userId}
          conversation={conver}
          isSelected={conver.id === selectedConversationId}
          onSelect={onSelect}
        />
      )}
    />
  );
}
