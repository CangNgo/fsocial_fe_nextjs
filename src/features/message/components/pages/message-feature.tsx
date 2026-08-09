"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { dateTimeToMessageTime } from "@/shared/utils/convert-date-time";
import { CirclePlus, Image, SearchIcon, SendHorizonal } from "lucide-react";
import type { KeyboardEvent } from "react";
import { useChooseConversation } from "../../hooks/use-choose-conversation";
import { useConversations } from "../../hooks/use-conversations";
import { useCreateConversation } from "../../hooks/use-create-conversation";
import { useMessageSubscription } from "../../hooks/use-message-subscription";
import { useSendMessage } from "../../hooks/use-send-message";
import { useUserSearch } from "../../hooks/use-user-search";
import { conversationAvatar, conversationDisplayName } from "../../utils/conversation-display";
import { MessageThread } from "../molecules/message-thread";
import { UserSearchResult } from "../molecules/user-search-result";

export default function MessageFeature() {
  const userId = ownerAccountStore((state) => state.user.id);
  const messages = useMessageStore((state) => state.messages);

  const { contentActive, setContentActive, conversations, handleOpenCreateConversation } =
    useConversations();
  const { selectedConversation, handleChooseConversation, handleGoBack } = useChooseConversation({
    contentActive,
    setContentActive,
  });
  const { content, setContent, handleSend } = useSendMessage(selectedConversation?.id);
  const { keyword, setKeyword, users, isSearching } = useUserSearch();
  const createConversation = useCreateConversation();

  useMessageSubscription();

  const handleSelectUser = (user: { id: string }) => {
    createConversation.mutate(user.id, {
      onSuccess: (resp) => {
        if (resp?.statusCode === 200 && resp.data) {
          handleChooseConversation(resp.data);
        }
      },
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div
      className={cn(
        "h-full flex-grow sm:flex bg-background transition",
        [1, 2].includes(contentActive) && "sm:relative fixed top-0 sm:z-0 z-10",
        ![1, 2].includes(contentActive) && "overflow-hidden",
      )}
    >
      <div
        className="
          flex flex-col pt-4 h-full
          sm:w-2/5 sm:min-w-[300px] sm:max-w-[350px] sm:gap-4 sm:border-r
          w-screen gap-2 transition"
      >
        <div className="px-4 flex items-center justify-between">
          <h2>Tin nhắn</h2>
          <Button
            type="button"
            variant="ghost"
            className="btn-transparent !w-fit p-1"
            onClick={handleOpenCreateConversation}
          >
            <CirclePlus />
          </Button>
        </div>

        <label
          htmlFor="search-message"
          className="flex gap-2 p-2 mx-4 border rounded-full hover:border-gray transition"
        >
          <SearchIcon className="size-5 ms-1 my-auto text-gray" />
          <Input
            type="text"
            id="search-message"
            placeholder="Tìm cuộc trò chuyện"
            className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </label>

        <div className="h-full px-2 flex-grow overflow-auto">
          {!conversations &&
            [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="px-3 py-2.5 h-16 flex items-center gap-3">
                <Skeleton className="size-11 rounded-full" />
                <div className="flex-grow space-y-2">
                  <Skeleton className="w-1/2 h-4 rounded-sm" />
                  <Skeleton className="h-4 rounded-sm" />
                </div>
              </div>
            ))}

          {conversations?.length === 0 && (
            <p className="px-3 py-2.5">Bắt đầu tạo cuộc trò chuyện mới nào</p>
          )}

          {conversations?.map((conver) => (
            <Button
              variant={"outline"}
              key={conver.id}
              className={cn(
                "w-full text-left px-3 py-2.5 h-auto rounded-md flex items-center gap-3 hover:bg-gray-200 transition cursor-pointer",
                conver.id === selectedConversation?.id && "bg-gray-100",
              )}
              onClick={() => handleChooseConversation(conver)}
            >
              <Avatar className="size-11">
                <AvatarImage src={conversationAvatar(conver, userId)} />
                <AvatarFallback className="fs-xs">
                  {getInitialsFromDisplayName(conversationDisplayName(conver, userId))}
                </AvatarFallback>
              </Avatar>

              <div className="flex-grow min-w-0">
                <span className="font-medium">{conversationDisplayName(conver, userId)}</span>
                {conver.lastMessage && (
                  <div className="flex gap-2 items-end justify-between">
                    <div className="line-clamp-1 text-gray">{conver.lastMessage.content}</div>
                    <span className="text-gray fs-xs text-nowrap">
                      {dateTimeToMessageTime(conver.lastMessage.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "size-full bg-background transition",
          [1, 2].includes(contentActive) ? "sm:translate-y-0 -translate-y-full" : "",
        )}
      >
        {contentActive === 0 && (
          <div className="size-full place-content-center sm:grid hidden">
            Cùng bắt đầu trò chuyện với người theo dõi của bạn
          </div>
        )}

        {contentActive === 1 && (
          <div className="size-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Button type="button" onClick={handleGoBack} className="btn-transparent p-1">
                ←
              </Button>
              <h4>Tạo cuộc trò chuyện mới</h4>
            </div>
            <div className="px-4 py-3">
              <Input
                type="text"
                placeholder="Tìm theo tên hiển thị"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex-grow overflow-auto px-2">
              {isSearching && <p className="px-3 py-2.5 text-gray">Đang tìm...</p>}
              {!isSearching && keyword.trim().length > 0 && users.length === 0 && (
                <p className="px-3 py-2.5 text-gray">Không tìm thấy người dùng</p>
              )}
              {users.map((user) => (
                <UserSearchResult
                  key={user.id}
                  user={user}
                  onSelect={handleSelectUser}
                  disabled={createConversation.isPending}
                />
              ))}
            </div>
          </div>
        )}

        {contentActive === 2 && selectedConversation && (
          <div className="size-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Button
                type="button"
                onClick={handleGoBack}
                className="btn-transparent p-1 sm:hidden"
              >
                ←
              </Button>
              <Avatar className="size-9">
                <AvatarImage src={conversationAvatar(selectedConversation, userId)} />
                <AvatarFallback>
                  {getInitialsFromDisplayName(conversationDisplayName(selectedConversation, userId))}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">
                {conversationDisplayName(selectedConversation, userId)}
              </span>
            </div>
            <div className="flex-grow overflow-y-auto scrollable-div p-4 flex flex-col gap-2">
              <MessageThread messages={messages} selfId={userId} />
            </div>
            <div className="px-4 py-3 border-t flex items-center gap-2 max-w-200">
              <Image size={40} />
              <Input
                type="text"
                placeholder="Nhắn tin..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" className="btn-transparent p-2 rounded-2xl w-13" onClick={handleSend}>
                <SendHorizonal className="size-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
