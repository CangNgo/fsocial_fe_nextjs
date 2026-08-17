"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { Image as ImageIcon, SendHorizonal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, type UIEvent } from "react";
import { useChooseConversation } from "../../hooks/use-choose-conversation";
import { useMessageSubscription } from "../../hooks/use-message-subscription";
import { useSendMessage } from "../../hooks/use-send-message";
import { conversationAvatar, conversationDisplayName } from "../../utils/conversation-display";
import { ConversationList } from "../molecules/conversation-list";
import ConversationSearch from "../molecules/conversation-search";
import { MessageComposer, type MessageComposerHandle } from "../molecules/message-composer";
import { MessageThread } from "../molecules/message-thread";

export default function MessageFeature() {
  const userId = ownerAccountStore((state) => state.user.id);
  const messages = useMessageStore((state) => state.messages);

  const { contentActive, setContentActive, conversations, fetchConversations, isLoading } =
    useConversationStore();
  const {
    activeConversation,
    handleChooseConversation,
    handleGoBack,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChooseConversation({
    contentActive,
    setContentActive,
  });
  const { setContent, handleSend, resetKey } = useSendMessage(activeConversation?.id);
  const composerRef = useRef<MessageComposerHandle>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | undefined>(undefined);
  const prevScrollHeightRef = useRef<number | null>(null);

  useMessageSubscription();

  useEffect(() => {
    if (!userId) return;
    fetchConversations();
  }, [userId, fetchConversations]);

  useEffect(() => {
    if (activeConversation) composerRef.current?.focus();
  }, [activeConversation?.id]);

  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1];
    if (!lastMessage || lastMessage.id === lastMessageIdRef.current) return;
    lastMessageIdRef.current = lastMessage.id;
    messageListRef.current?.scroll({ top: messageListRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useLayoutEffect(() => {
    const el = messageListRef.current;
    const prevScrollHeight = prevScrollHeightRef.current;
    if (!el || prevScrollHeight === null) return;
    el.scrollTop = el.scrollHeight - prevScrollHeight;
    prevScrollHeightRef.current = null;
  }, [messages]);

  const handleThreadScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop > 0 || !hasNextPage || isFetchingNextPage) return;
    prevScrollHeightRef.current = el.scrollHeight;
    fetchNextPage();
  };

  return (
    <div
      className={cn(
        "h-full grow sm:flex bg-background transition",
        contentActive === 2 && "sm:relative fixed top-0 sm:z-0 z-10",
        contentActive !== 2 && "overflow-hidden",
      )}
    >
      <div
        className="
          flex flex-col pt-4 h-full
          sm:w-2/5 sm:min-w-75 sm:max-w-87.5 sm:gap-4 sm:border-r
          w-screen gap-2 transition"
      >
        <div className="px-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Tin nhắn</h2>
        </div>
        {/* search */}
        <ConversationSearch />
        {/* list conversation  */}
        <ConversationList
          userId={userId}
          conversations={conversations}
          selectedConversationId={activeConversation?.id}
          isLoading={isLoading}
          onSelect={handleChooseConversation}
        />
      </div>

      <div
        className={cn(
          "size-full bg-background transition",
          contentActive === 2 ? "sm:translate-y-0 -translate-y-full" : "",
        )}
      >
        {!activeConversation && (
          <div className="size-full place-content-center sm:grid hidden">
            Cùng bắt đầu trò chuyện với người theo dõi của bạn
          </div>
        )}

        {activeConversation && (
          <div className="size-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={conversationAvatar(activeConversation, userId)} />
                <AvatarFallback>
                  {getInitialsFromDisplayName(conversationDisplayName(activeConversation, userId))}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">
                {conversationDisplayName(activeConversation, userId)}
              </span>
            </div>
            <div
              ref={messageListRef}
              className="grow min-h-0 overflow-y-auto scrollable-div p-4 flex flex-col gap-2"
              onScroll={handleThreadScroll}
            >
              <MessageThread messages={messages} selfId={userId} />
            </div>
            <div className="px-4 py-3 border-t flex items-end gap-2 w-full">
              <ImageIcon size={30} className="shrink-0" />
              <MessageComposer
                ref={composerRef}
                resetKey={resetKey}
                onChange={setContent}
                onSend={handleSend}
                placeholder="Nhắn tin..."
                className="grow min-w-0 max-h-52 overflow-y-auto"
              />
              <Button
                type="button"
                className="btn-transparent p-2 rounded-2xl w-10 shrink-0"
                onClick={handleSend}
              >
                <SendHorizonal size={30} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
