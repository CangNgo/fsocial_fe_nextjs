"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createConversation } from "@/services/message/message-api";
import { messageKeys } from "@/services/message/message.key";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const userId = ownerAccountStore((state) => state.user.id);

  return useMutation({
    mutationFn: (memberId: string) => createConversation([memberId]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId ?? "") });
    },
  });
}
