"use client";
import { Client } from "@stomp/stompjs";
import { create } from "zustand";
import { dateTimeToNotiTime } from "@/utils/convertDateTime";

export interface Notification {
  id: string;
  message?: string;
  content?: string;
  read: boolean;
  createdAt: string;
  textTime?: string;
  labelType?: number;
  [key: string]: unknown;
}

interface NotificationStore {
  unreadCount: number;
  notifications: Notification[] | null;
  stompClientNotification: Client | null;

  connectNotificationWebSocket: (userId: string) => void;
  cleanNotificationWebSocket: () => void;
  setNotifications: (notifications: Notification[]) => void;
  appendNotifications: (newNotifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  updateNotification: (id: string, props: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  insertNotifications: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  unreadCount: 0,
  notifications: null,
  stompClientNotification: null,

  connectNotificationWebSocket: (userId) => {
    const { stompClientNotification } = get();
    if (stompClientNotification) return;

    const wsHost =
      process.env.NEXT_PUBLIC_WS_HOST_NOTIFICATION ??
      process.env.NEXT_PUBLIC_WS_HOST ??
      "localhost:8888";
    const wsProtocol = process.env.NEXT_PUBLIC_WS_PROTOCOL ?? "ws";
    const notificationBaseURL = `${wsProtocol}://${wsHost}/post/ws`;

    const client = new Client({
      brokerURL: notificationBaseURL,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications-${userId}`, (message) => {
          const receivedMessage = JSON.parse(message.body) as Notification;
          get().insertNotifications(receivedMessage);
          get().setUnreadCount(get().unreadCount + 1);
        });
        set({ stompClientNotification: client });
      },
    });
    client.activate();
  },

  cleanNotificationWebSocket: () => {
    const { stompClientNotification } = get();
    if (!stompClientNotification) return;
    stompClientNotification.deactivate().then(() => {
      set({ unreadCount: 0, notifications: null, stompClientNotification: null });
    });
  },

  setNotifications: (notifications) => set({ notifications }),

  appendNotifications: (newNotifications) => {
    const current = get().notifications ?? [];
    set({ notifications: [...current, ...newNotifications] });
  },

  setUnreadCount: (unreadCount) => set({ unreadCount }),

  updateNotification: (id, props) => {
    const updated = (get().notifications ?? []).map((n) => (n.id === id ? { ...n, ...props } : n));
    set({ notifications: updated });
  },

  deleteNotification: (id) => {
    const filtered = (get().notifications ?? []).filter((n) => n.id !== id);
    set({ notifications: filtered });
  },

  insertNotifications: (notification) => {
    const { textTime, labelType } = dateTimeToNotiTime(notification.createdAt);
    const current = get().notifications ?? [];
    set({
      notifications: [{ ...notification, textTime, labelType }, ...current],
    });
  },
}));
