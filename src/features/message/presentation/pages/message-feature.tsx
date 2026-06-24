"use client";
import { CirclePlus, SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { regexInMessage } from "@/shared/config/regex";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";
import { dateTimeToMessageTime } from "@/shared/utils/convert-date-time";
import { getConversations, getMessages } from "../../api/message-api";

interface Conversation {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  receiverId?: string;
  lastMessage?: {
    content: string;
    read: boolean;
    createAt: string;
  };
  [key: string]: unknown;
}

export default function MessageFeature() {
  const user = ownerAccountStore((state) => state.user);
  const pathname = usePathname();

  const { setMessages, conversation, setConversation, setSubscription, newMessage, setNewMessage } =
    useMessageStore();

  // 0 = list, 1 = create conversation, 2 = messaging
  const [contentActive, setContentActive] = useState(0);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [trigger, setTrigger] = useState(true);
  const controllerGetmsgs = useRef<AbortController | null>(null);

  const handleOpenCreateConversation = () => {
    setContentActive(1);
  };

  const handleGetAllConversation = useCallback(async () => {
    const resp = (await getConversations()) as any;
    if (!resp || resp.statusCode !== 200) return;
    setConversations(resp.data);
    if (conversation) setContentActive(2);
  }, [conversation]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run when the logged-in user changes, not on every conversation update
  useEffect(() => {
    if (!user?.userId) return;
    handleGetAllConversation();
    setNewMessage(null);
  }, [user?.userId]);

  // update conversations list when a new message arrives
  const updateConversations = useCallback((baseConversation: Partial<Conversation>) => {
    setConversations((prevConversations) => {
      if (!prevConversations) return prevConversations;
      const existConversation = prevConversations.find(
        (conver) => conver.id === baseConversation.id,
      );
      if (existConversation) {
        const updated = { ...existConversation, lastMessage: baseConversation.lastMessage };
        return [updated, ...prevConversations.filter((c) => c.id !== existConversation.id)];
      }
      return [baseConversation as Conversation, ...prevConversations];
    });
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: excludes `conversations` — it changes inside this effect via updateConversations and would retrigger it
  useEffect(() => {
    if (!newMessage || !conversation || !conversations) return;
    if (newMessage.conversationId === conversation.id && regexInMessage.test(pathname)) {
      (newMessage as any).read = true;
    }
    const baseConversation: Partial<Conversation> = {
      id: newMessage.conversationId,
      lastMessage: newMessage as any,
    };
    updateConversations(baseConversation);
    setNewMessage(null);
  }, [newMessage, pathname, updateConversations, setNewMessage, conversation]);

  const handleChooseConversation = async (selectedConver: Conversation) => {
    if (conversation && conversation.id === selectedConver.id && contentActive === 2) {
      return;
    }
    setMessages(null as any);
    setContentActive(2);
    setTrigger(!trigger);
    if (selectedConver.lastMessage) (selectedConver.lastMessage as any).read = true;
    setConversation(selectedConver as any);
    setSubscription(selectedConver.id);

    if (controllerGetmsgs.current) controllerGetmsgs.current.abort();
    controllerGetmsgs.current = new AbortController();

    const resp = (await getMessages(selectedConver.id, controllerGetmsgs.current.signal)) as any;

    if (!resp || resp.statusCode !== 200) return;
    setMessages([...(resp.data?.listMessages ?? [])].reverse());
  };

  const handleGoBack = () => {
    setContentActive(0);
    setConversation(null);
  };

  return (
    <div
      className={cn(
        "h-full flex-grow sm:flex bg-background transition",
        [1, 2].includes(contentActive) && "sm:relative fixed top-0 sm:z-0 z-10",
        ![1, 2].includes(contentActive) && "overflow-hidden",
      )}
    >
      {/* Conversation list */}
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

        {/* search bar */}
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

        {/* conversation list */}
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
              type="button"
              key={conver.id}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 hover:bg-gray-2light transition cursor-pointer",
                conver.id === conversation?.id && "bg-gray-3light",
              )}
              onClick={() => handleChooseConversation(conver)}
            >
              <Avatar className="size-11">
                <AvatarImage src={conver.avatar} />
                <AvatarFallback className="fs-xs">
                  {combineIntoAvatarName(conver.firstName ?? "", conver.lastName ?? "")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {combineIntoDisplayName(conver.firstName ?? "", conver.lastName ?? "")}
                  </span>
                  {conver.lastMessage && !conver.lastMessage.read && (
                    <span className="size-2 bg-primary-gradient rounded-full" />
                  )}
                </div>
                {conver.lastMessage && (
                  <div className="flex gap-2 items-end justify-between">
                    <div
                      className={cn(
                        "line-clamp-1 text-gray",
                        !conver.lastMessage.read && "font-semibold text-primary-text",
                      )}
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: renders pre-sanitized formatted last-message preview
                      dangerouslySetInnerHTML={{ __html: conver.lastMessage.content }}
                    />
                    <span className="text-gray fs-xs text-nowrap">
                      {dateTimeToMessageTime(conver.lastMessage.createAt)}
                    </span>
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Content panel */}
      <div
        className={cn(
          "size-full bg-background transition",
          [1, 2].includes(contentActive) ? "sm:translate-y-0 -translate-y-full" : "",
        )}
      >
        {/* No conversation selected */}
        {contentActive === 0 && (
          <div className="size-full place-content-center sm:grid hidden">
            Cùng bắt đầu trò chuyện với người theo dõi của bạn
          </div>
        )}

        {/* Create conversation */}
        {contentActive === 1 && (
          <div className="size-full flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <Button type="button" onClick={handleGoBack} className="btn-transparent p-1">
                ←
              </Button>
              <h4>Tạo cuộc trò chuyện mới</h4>
            </div>
            <div className="flex-grow flex items-center justify-center text-gray">
              Chọn người để bắt đầu trò chuyện
            </div>
          </div>
        )}

        {/* Messaging */}
        {contentActive === 2 && conversation && (
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
                <AvatarImage src={(conversation as any).avatar} />
                <AvatarFallback>
                  {combineIntoAvatarName(
                    (conversation as any).firstName ?? "",
                    (conversation as any).lastName ?? "",
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">
                {combineIntoDisplayName(
                  (conversation as any).firstName ?? "",
                  (conversation as any).lastName ?? "",
                )}
              </span>
            </div>
            <div className="flex-grow overflow-y-auto scrollable-div p-4 flex flex-col gap-2">
              {/* Messages are rendered here — integrate MessageHandleMessages when available */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
