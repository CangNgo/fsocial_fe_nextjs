import { apiGet, apiPut } from "../core/api-service";

export async function getNotification(userId: string): Promise<unknown> {
  return apiGet(`/notice/${userId}`);
}

export async function markReadNotification(id: string): Promise<unknown> {
  return apiPut(`/notice/${id}`);
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
}): Promise<unknown> {
  return apiGet("/notice", {
    params: { userId, channelId, page, limit },
  });
}
