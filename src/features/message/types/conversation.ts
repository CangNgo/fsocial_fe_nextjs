export interface LastMessage {
  content: string;
  read: boolean;
  createAt: string;
}

export interface Conversation {
  id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  receiverId?: string;
  lastMessage?: LastMessage;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  createAt: string;
  type?: string;
  read?: boolean;
}

export interface ConversationsResponse {
  statusCode?: number;
  data?: Conversation[];
}

export interface MessagesResponse {
  statusCode?: number;
  data?: {
    listMessages?: Message[];
  };
}
