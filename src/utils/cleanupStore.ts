import { useMessageStore } from "@/store/messageStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ownerAccountStore } from "@/store/ownerAccountStore";

export default function cleanupStore() {
  ownerAccountStore.getState().cleanOwnerAccountStore();
  useMessageStore.getState().cleanMessageWebSocket();
  useNotificationStore.getState().cleanNotificationWebSocket();
}
