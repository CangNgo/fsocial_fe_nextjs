export type ChatRole = "user" | "bot";

export type ChatMessageStatus = "sending" | "sent" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  status?: ChatMessageStatus;
  /** Prompt gốc đã gây lỗi — giữ lại để nút "Thử lại" gửi đúng câu đó. */
  failedPrompt?: string;
}

/** Payload backend đẩy về /user/queue/ai. */
export interface AiChatReply {
  requestId: string;
  content: string;
  success: boolean;
}
