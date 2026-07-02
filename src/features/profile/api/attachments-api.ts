import { apiPost } from "@/shared/api/core/api-service";
import type { AttachmentsRequest } from "../types/attachments";

export const getPictures = async (attachmentsRequest: AttachmentsRequest): Promise<unknown> => {
  return apiPost("/attachments", attachmentsRequest);
};
