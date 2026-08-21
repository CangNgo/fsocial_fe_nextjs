"use client";

import { startOnlineHeartbeat } from "@/services/online/online-api";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { useEffect } from "react";
import { ConversationSidebar } from "../organisms/conversation-sidebar";
import { MessageThreadPanel } from "../organisms/message-thread-panel";

export default function MessageFeature() {
  const userId = ownerAccountStore((state) => state.user.id);
  const isThreadOpen = useConversationStore((state) => state.isThreadOpen);
  const fetchConversations = useConversationStore((state) => state.fetchConversations);

  useEffect(() => {
    if (!userId) return;
    // Mark online ngay khi có danh sách conversation, thay vì đợi chu kỳ 30s
    // tiếp theo mới lấy đúng danh sách partner (lần mark ở WS connect có thể
    // chạy trước khi conversations load xong).
    fetchConversations().then(() => startOnlineHeartbeat());
  }, [userId, fetchConversations]);

  return (
    <div
      className={cn(
        "h-full grow sm:flex bg-background transition",
        isThreadOpen ? "sm:relative fixed top-0 sm:z-0 z-10" : "overflow-hidden",
      )}
    >
      <ConversationSidebar />

      <div
        className={cn(
          "size-full bg-background transition",
          isThreadOpen && "sm:translate-y-0 -translate-y-full",
        )}
      >
        <MessageThreadPanel />
      </div>
    </div>
  );
}
