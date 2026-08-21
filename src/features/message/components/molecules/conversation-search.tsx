"use client";

import { Input } from "@/shared/components/ui/input";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import type { Conversation } from "@/shared/types/message";
import type { UserResult } from "@/shared/types/search";
import { SearchIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { useChooseConversation } from "../../hooks/use-choose-conversation";
import { useUserSearch } from "../../hooks/use-user-search";
import { UserSearchSkeleton } from "../atoms/message-skeletons";
import { UserSearchResult } from "./user-search-result";

const RESULT_ROW_HEIGHT = 64;
const RESULT_MAX_HEIGHT = 320;

export default function ConversationSearch() {
  const { keyword, setKeyword, users, isSearching } = useUserSearch();
  const conversations = useConversationStore((state) => state.conversations);
  const addDraftConversation = useConversationStore((state) => state.addDraftConversation);
  const { handleChooseConversation } = useChooseConversation();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Click user: nếu đã có conversation thật với người này thì mở lại, không thì chỉ tạo
  // draft ở UI — conversation thật chỉ được tạo khi gửi tin nhắn đầu tiên (useSendMessage).
  const handleSelectUser = (user: UserResult) => {
    const existing = conversations.find(
      (c) => !c.isDraft && c.type === "DIRECT" && c.members.some((m) => m.userId === user.id),
    );

    if (existing) {
      handleChooseConversation(existing);
    } else {
      const draft: Conversation = {
        id: `draft-${user.id}`,
        type: "DIRECT",
        name: user.displayName,
        avatarUrl: user.avatar ?? undefined,
        members: [
          { userId: user.id, displayName: user.displayName, avatar: user.avatar ?? undefined },
        ],
        unreadCount: 0,
        isDraft: true,
      };
      addDraftConversation(draft);
      handleChooseConversation(draft);
    }

    setKeyword("");
    setIsOpen(false);
  };

  const showDropdown = isOpen && keyword.trim().length > 0;
  const hasResults = Boolean(users && users.length > 0);

  return (
    <div className="relative mx-4" ref={containerRef}>
      <label
        htmlFor="search-message"
        className="flex gap-2 p-2 border rounded-full hover:border-primary transition"
      >
        <SearchIcon className="size-5 my-auto text-gray" />
        <Input
          type="text"
          id="search-message"
          placeholder="Tìm theo tên hiển thị"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="h-auto border-0 p-0 px-1 shadow-none bg-background"
        />
      </label>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-80 overflow-auto rounded-lg border bg-background shadow-lg">
          {isSearching && <UserSearchSkeleton />}

          {!isSearching && users && !hasResults && (
            <div className="h-20 w-full px-3 py-2.5 flex justify-center items-center">
              Không tìm thấy người dùng
            </div>
          )}

          {!isSearching && users && hasResults && (
            <Virtuoso
              style={{ height: Math.min(users.length * RESULT_ROW_HEIGHT, RESULT_MAX_HEIGHT) }}
              data={users}
              computeItemKey={(_, user) => user.id}
              itemContent={(_, user) => <UserSearchResult user={user} onSelect={handleSelectUser} />}
            />
          )}
        </div>
      )}
    </div>
  );
}
