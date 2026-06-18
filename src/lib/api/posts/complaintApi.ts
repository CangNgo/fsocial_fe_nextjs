import { apiGet, apiPost, apiPut } from "../apiService";

export const complaint = async (complaintData: unknown): Promise<unknown> => {
  return apiPost("/post/complaint", complaintData, undefined, {});
};

export const getComplaint = async (): Promise<unknown> => {
  return apiGet("/post/complaint");
};

export const readingComplaint = async (id: string): Promise<unknown> => {
  return apiPut(`/post/complaint/reading?complaint_id=${id}`);
};
