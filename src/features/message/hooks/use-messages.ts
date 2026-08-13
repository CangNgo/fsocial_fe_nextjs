"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/services/message/message-api";
import { messageKeys } from "@/services/message/message.key";

// Phải khớp PAGE_SIZE bên backend (ChatServiceImpl) — backend không trả hasMore/nextCursor,
// nên suy ra còn trang tiếp theo khi page vừa fetch đầy PAGE_SIZE.
const MESSAGE_PAGE_SIZE = 20;

export function useMessages(conversationId?: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.thread(conversationId ?? ""),
    queryFn: ({ pageParam }) => getMessages(conversationId ?? "", pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      const items = lastPage?.data ?? [];
      if (items.length < MESSAGE_PAGE_SIZE) return undefined;
      const oldest = items[items.length - 1];
      return `${new Date(oldest.createdAt).getTime()}_${oldest.id}`;
    },
    enabled: Boolean(conversationId),
  });
}
