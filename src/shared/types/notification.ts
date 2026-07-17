
export interface Notification {
  id: string;
  recipientId: string;
  actor: ActorSnapshot;
  type: NotificationType;
  groupKey: string;
  aggregatedActors: ActorSnapshot[];
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface ActorSnapshot {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
}

export enum NotificationType {
  LIKE_SINGLE = "LIKE_SINGLE",
  LIKE_MULTI = "LIKE_MULTI",
  COMMENT_SINGLE = "COMMENT_SINGLE",
  COMMENT_MULTI = "COMMENT_MULTI",
  COMMENT_REPLY = "COMMENT_REPLY",
  FOLLOW = "FOLLOW",
  MENTION = "MENTION",
  MESSAGE = "MESSAGE",
  SYSTEM = "SYSTEM",
  LOGIN = "LOGIN"
}