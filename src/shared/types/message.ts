export type ConversationType = "DIRECT" | "GROUP";

export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "FILE" | "SYSTEM";

// Chỉ set ở client cho optimistic UI; message thật từ server không có field này.
export type MessageStatus = "sending" | "failed";

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
  actorSnapshotDTO?: ConversationMemberSnapshot;
  status?: MessageStatus;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  avatarUrl?: string;
  members: ConversationMemberSnapshot[];
  lastMessage?: Message;
  unreadCount: number;
  online?: boolean;
  // Conversation nháp tạo ở client khi chọn user từ kết quả search, chưa gọi API tạo thật.
  isDraft?: boolean;
}
