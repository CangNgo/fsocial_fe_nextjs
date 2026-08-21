"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createConversation } from "@/services/message/message-api";
import { useConversationStore } from "@/shared/stores/use-conversation-store";

export function useCreateConversation() {
  const addConversation = useConversationStore((state) => state.addConversation);

  return useMutation({
    mutationFn: (memberId: string) => createConversation([memberId]),
    onSuccess: (resp) => {
      if (resp?.statusCode === 200 && resp.data) {
        addConversation(resp.data);
      } else {
        toast.error("Không thể tạo cuộc trò chuyện, vui lòng thử lại");
      }
    },
  });
}
