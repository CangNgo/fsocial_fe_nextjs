export const CHATBOT_NAME = "Flowzone";

export const CHATBOT_AVATAR = "/logo/chibi-flowzone-bg.png";

export const CHATBOT_STATUS_TEXT = "Trợ lý AI • Đang hoạt động";

export const CHATBOT_WELCOME = "Xin chào! Mình là Flowzone. Mình có thể giúp gì cho bạn?";

export const CHATBOT_ERROR_TEXT = "Có lỗi xảy ra, vui lòng thử lại.";

export const CHATBOT_MAX_PROMPT = 1000;

export const CHATBOT_COUNTER_THRESHOLD = 800;

/** Destination STOMP — khớp @MessageMapping("/ai.ask") + prefix /app của backend. */
export const AI_SEND_DESTINATION = "/app/ai.ask";

/** Backend gửi qua convertAndSendToUser(userId, "/queue/ai", ...) — client nghe kèm prefix /user. */
export const AI_QUEUE = "/user/queue/ai";
