
import type { ApiResponse, InfinityResponse } from "@/shared/types/api-response";
import { Notification } from "@/shared/types/notification";
import { apiGet, apiPut } from "../core/api-service";

export async function getNotification(userId: string): Promise<ApiResponse<Notification[]> | null> {
  return apiGet<Notification[]>(`/notice/${userId}`);
}

export async function markReadNotification(id: string): Promise<ApiResponse<null> | null> {
  return apiPut<null>(`/notice/${id}`);
}

export async function getNotifications({
  cursor
}: {
  cursor?: string;
}): Promise<ApiResponse<InfinityResponse<Notification[]>> | null> {
  return apiGet<InfinityResponse<Notification[]>>("/notification", {
    params: { cursor },
  });
}

export async function getUnreadNotification(): Promise<ApiResponse<number> | null> {
  return apiGet<number>("/notification/un-read")
}
