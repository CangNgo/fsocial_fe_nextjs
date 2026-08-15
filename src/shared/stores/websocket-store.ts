"use client";
import { getCookie } from "@/shared/utils/cookie";
import { Client } from "@stomp/stompjs";
import { create } from "zustand";

type ConnectHandler = () => void;

// Danh sách handler ngoài store: không cần reactive, tránh re-render khi đăng ký/hủy.
let connectHandlers: ConnectHandler[] = [];

interface WebSocketStore {
  client: Client | null;
  connect: () => Client;
  disconnect: () => void;
  onConnect: (handler: ConnectHandler) => () => void;
}

export const useWebSocketStore = create<WebSocketStore>()((set, get) => ({
  client: null,

  connect: () => {
    const existing = get().client;
    if (existing) return existing;

    const wsHost = process.env.NEXT_PUBLIC_WS_HOST;
    const apiVersion = process.env.NEXT_PUBLIC_API_VERSION;
    const token = getCookie("access-token");
    const client = new Client({
      brokerURL: `${wsHost}/${apiVersion}/ws`,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 10000,
      onConnect: () => {
        connectHandlers.forEach((handler) => handler());
      },
      onStompError: (frame) => {
        console.error("[WS] STOMP error:", frame.headers["message"], frame.body);
      },
      onWebSocketError: (event) => {
        console.error("[WS] WebSocket error:", event);
      },
      onWebSocketClose: (event) => {
        console.warn("[WS] WebSocket closed:", event.code, event.reason);
      },
    });
    client.activate();
    set({ client });
    return client;
  },

  disconnect: () => {
    const { client } = get();
    if (!client) return;
    connectHandlers = [];
    client.deactivate().then(() => set({ client: null }));
  },

  // Đăng ký việc cần chạy mỗi khi (re)connect thành công. Trả về hàm hủy đăng ký.
  onConnect: (handler) => {
    connectHandlers.push(handler);
    return () => {
      connectHandlers = connectHandlers.filter((h) => h !== handler);
    };
  },
}));
