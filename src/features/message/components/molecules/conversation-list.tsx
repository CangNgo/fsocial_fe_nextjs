"use client";

import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { Virtuoso } from "react-virtuoso";
import { useChooseConversation } from "../../hooks/use-choose-conversation";
import { ConversationListSkeleton } from "../atoms/message-skeletons";
import { ConversationItem } from "./conversation-item";

export function ConversationList() {
  const selfId = ownerAccountStore((state) => state.user.id);
  const conversations = useConversationStore((state) => state.conversations);
  const status = useConversationStore((state) => state.status);
  const { activeConversationId, handleChooseConversation } = useChooseConversation();

  if (status !== "ready") return <ConversationListSkeleton />;

  if (conversations.length === 0) {
    return <p className="px-3 py-2.5">Bắt đầu tạo cuộc trò chuyện mới nào</p>;
  }

  return (
    <Virtuoso
      className="h-full grow"
      data={conversations}
      computeItemKey={(_, conversation) => conversation.id}
      itemContent={(_, conversation) => (
        <ConversationItem
          conversation={conversation}
          selfId={selfId}
          isSelected={conversation.id === activeConversationId}
          onSelect={handleChooseConversation}
        />
      )}
    />
  );
}
