import type { Conversation } from "@/shared/types/message";

export function otherMember(conversation: Conversation, selfId?: string) {
  return conversation.members.find((member) => member.userId !== selfId) ?? conversation.members[0];
}

export function conversationDisplayName(conversation: Conversation, selfId?: string): string {
  if (conversation.name) return conversation.name;
  return otherMember(conversation, selfId)?.displayName ?? "";
}

export function conversationAvatar(
  conversation: Conversation,
  selfId?: string,
): string | undefined {
  if (conversation.avatarUrl) return conversation.avatarUrl;
  return otherMember(conversation, selfId)?.avatar;
}
