import type { ApiResponse } from "@/shared/types/api-response";
import type { Notification } from "@/shared/stores/notification-store";
import { apiGet, apiPut } from "../core/api-service";

export async function getNotification(userId: string): Promise<ApiResponse<Notification[]> | null> {
  return apiGet<Notification[]>(`/notice/${userId}`);
}

export async function markReadNotification(id: string): Promise<ApiResponse<null> | null> {
  return apiPut<null>(`/notice/${id}`);
}

export async function getNotificationWithPagination({
  userId,
  channelId = "INBOX",
  page = 0,
  limit = 10,
}: {
  userId: string;
  channelId?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Notification[]> | null> {
  return apiGet<Notification[]>("/notice", {
    params: { userId, channelId, page, limit },
  });
}
