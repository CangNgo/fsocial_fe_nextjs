import { apiGet, apiPost, apiPut } from "@/shared/api/core/api-service";

export const complaint = async (complaintData: unknown): Promise<unknown> => {
  return apiPost("/complaint", complaintData, undefined, {});
};

export const getComplaint = async (): Promise<unknown> => {
  return apiGet("/complaint");
};

export const readingComplaint = async (id: string): Promise<unknown> => {
  return apiPut(`/complaint/reading?complaint_id=${id}`);
};
