"use client";

import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { Loader2 } from "lucide-react";
import { useActiveConversation } from "../../hooks/use-choose-conversation";
import { useMessageThread } from "../../hooks/use-message-thread";
import { useSendMessage } from "../../hooks/use-send-message";
import { MessageThreadSkeleton } from "../atoms/message-skeletons";
import { MessageInputBar } from "../molecules/message-input-bar";
import { MessageThread } from "../molecules/message-thread";
import { MessageThreadHeader } from "../molecules/message-thread-header";

export function MessageThreadPanel() {
  const selfId = ownerAccountStore((state) => state.user.id);
  const conversation = useActiveConversation();
  const { messages, listRef, handleScroll, isLoading, isFetchingNextPage } =
    useMessageThread(conversation);
  const { setContent, handleSend, resetKey, isCreating } = useSendMessage(conversation);

  if (!conversation) {
    return (
      <div className="size-full place-content-center sm:grid hidden">
        Cùng bắt đầu trò chuyện với người theo dõi của bạn
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col">
      <MessageThreadHeader conversation={conversation} selfId={selfId} />

      {isLoading ? (
        <MessageThreadSkeleton />
      ) : (
        <div
          ref={listRef}
          className="grow min-h-0 overflow-y-auto scrollable-div p-4 flex flex-col gap-2"
          onScroll={handleScroll}
        >
          {isFetchingNextPage && (
            <Loader2 className="size-5 animate-spin self-center shrink-0 text-gray" />
          )}
          <MessageThread messages={messages} selfId={selfId} />
        </div>
      )}

      <MessageInputBar
        resetKey={resetKey}
        focusKey={conversation.id}
        disabled={isCreating}
        onChange={setContent}
        onSend={handleSend}
      />
    </div>
  );
}
