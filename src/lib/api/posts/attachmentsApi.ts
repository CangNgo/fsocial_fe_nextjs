import type { AttachmentsRequest } from "@/types/attachments";
import { apiPost } from "../apiService";

export const getPictures = async (attachmentsRequest: AttachmentsRequest): Promise<unknown> => {
  return apiPost("/post/attachments", attachmentsRequest);
};
