import { apiGet, apiPut } from "../apiService";

export async function getNotification(userId: string): Promise<unknown> {
  return apiGet(`/post/notice/${userId}`);
}

export async function markReadNotification(id: string): Promise<unknown> {
  return apiPut(`/post/notice/${id}`);
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
  return apiGet("/post/notice", {
    params: { userId, channelId, page, limit },
  });
}
