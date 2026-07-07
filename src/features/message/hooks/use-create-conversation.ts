"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageKeys } from "@/services/message/message.key";
import { createConversation } from "@/services/message/message-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const userId = ownerAccountStore((state) => state.user.id);

  return useMutation({
    mutationFn: (receiverId: string) => createConversation(userId ?? "", receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations(userId ?? "") });
    },
  });
}
