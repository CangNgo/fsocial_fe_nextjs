import { apiPost } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { AttachmentsRequest, AttachmentsResponse } from "@/shared/types/attachments";

export const getPictures = async (
  attachmentsRequest: AttachmentsRequest,
): Promise<ApiResponse<AttachmentsResponse[]> | null> => {
  return apiPost<AttachmentsResponse[]>("/attachments", attachmentsRequest);
};
