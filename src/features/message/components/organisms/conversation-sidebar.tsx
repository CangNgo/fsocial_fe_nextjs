"use client";

import { ConversationList } from "../molecules/conversation-list";
import ConversationSearch from "../molecules/conversation-search";

export function ConversationSidebar() {
  return (
    <div
      className="
        flex flex-col pt-4 h-full
        sm:w-2/5 sm:min-w-75 sm:max-w-87.5 sm:gap-4 sm:border-r
        w-screen gap-2 transition"
    >
      <div className="px-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">Tin nhắn</h2>
      </div>
      <ConversationSearch />
      <ConversationList />
    </div>
  );
}
