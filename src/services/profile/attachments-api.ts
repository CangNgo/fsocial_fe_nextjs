import { apiPost } from "@/services/core/api-service";
import type { ApiResponse, InfinityResponse } from "@/shared/types/api-response";
import type { AttachmentMediaResponse, AttachmentsRequest, AttachmentsResponse } from "@/shared/types/attachments";

export const getPictures = async (
  attachmentsRequest: AttachmentsRequest,
): Promise<ApiResponse<AttachmentsResponse[]> | null> => {
  return apiPost<AttachmentsResponse[]>("/attachments", attachmentsRequest);
};

export const getAttachmentImage = async (
  attachmentsRequest: AttachmentsRequest,
): Promise<ApiResponse<InfinityResponse<AttachmentMediaResponse[]>> | null> => {
  return apiPost<InfinityResponse<AttachmentMediaResponse[]>>("/attachment", attachmentsRequest);
};