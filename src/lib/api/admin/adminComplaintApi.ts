import { apiGet, apiPost, apiPut } from "../apiService";

export const getComplaint = async (): Promise<unknown> => {
  return apiGet("/complaint");
};

export const getPostComplaint = async (): Promise<unknown> => {
  return apiGet("/complaint/post");
};

export const getUserComplaint = async (): Promise<unknown> => {
  return apiGet("/complaint/user");
};

export const postComplaint = async (userId: string, postId: string): Promise<unknown> => {
  return apiPost("/post/complaint", { userId, postId });
};

export const readingComplaint = async (id: string): Promise<unknown> => {
  return apiPut(`/post/complaint/reading?complaint_id=${id}`);
};

export const searchComplaint = async (keyword: string): Promise<unknown> => {
  return apiGet(`/complaint/find?find_name=${keyword}`);
};
