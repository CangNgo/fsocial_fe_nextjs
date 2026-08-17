import { useConversationStore } from "@/shared/stores/use-conversation-store";
import { useWebSocketStore } from "@/shared/stores/websocket-store";
import type { Client, StompSubscription } from "@stomp/stompjs";

const MARK_ONLINE_DESTINATION = "/app/online/mark-online";
const CONVERSATION_ONLINE_QUEUE = "/user/queue/conversation/online";
const HEARTBEAT_INTERVAL_MS = 30000;

let heartbeatId: ReturnType<typeof setInterval> | null = null;
let onlineSub: StompSubscription | null = null;

function markOnline(client: Client) {
  if (!client.connected) return;
  const userIds = useConversationStore.getState().getDirectPartnerIds();
  client.publish({ destination: MARK_ONLINE_DESTINATION, body: JSON.stringify(userIds) });
}

export function startOnlineHeartbeat() {
  const client = useWebSocketStore.getState().client;

  if (client) {
    // Re-subscribe mỗi lần connect (kể cả reconnect) vì subscription cũ mất khi mất kết nối.
    onlineSub?.unsubscribe();
    onlineSub = client.subscribe(CONVERSATION_ONLINE_QUEUE, (frame) => {
      const online = JSON.parse(frame.body) as Record<string, boolean>;
      useConversationStore.getState().setOnlineStatuses(online);
    });
    markOnline(client);
  }

  if (heartbeatId) return;
  heartbeatId = setInterval(() => {
    const current = useWebSocketStore.getState().client;
    if (current) markOnline(current);
  }, HEARTBEAT_INTERVAL_MS);
}

export function stopOnlineHeartbeat() {
  onlineSub?.unsubscribe();
  onlineSub = null;
  if (!heartbeatId) return;
  clearInterval(heartbeatId);
  heartbeatId = null;
}
