export type ConversationType = "DIRECT" | "GROUP";

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "SYSTEM";

export interface ConversationMemberSnapshot {
  userId: string;
  displayName?: string;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  members: ConversationMemberSnapshot[];
  lastMessage?: Message;
}
