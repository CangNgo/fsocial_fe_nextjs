import { useWebSocketStore } from "@/shared/stores/websocket-store";
import type { Client } from "@stomp/stompjs";

const MARK_ONLINE_DESTINATION = "/app/online/mark-online";
const HEARTBEAT_INTERVAL_MS = 30000;

let heartbeatId: ReturnType<typeof setInterval> | null = null;

function markOnline(client: Client) {
  if (!client.connected) return;
  client.publish({ destination: MARK_ONLINE_DESTINATION });
}

export function startOnlineHeartbeat() {
  if (heartbeatId) return;

  const client = useWebSocketStore.getState().client;
  if (client) markOnline(client);

  heartbeatId = setInterval(() => {
    const current = useWebSocketStore.getState().client;
    if (current) markOnline(current);
  }, HEARTBEAT_INTERVAL_MS);
}

export function stopOnlineHeartbeat() {
  if (!heartbeatId) return;
  clearInterval(heartbeatId);
  heartbeatId = null;
}
