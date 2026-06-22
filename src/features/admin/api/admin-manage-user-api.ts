import { apiGet, apiPost } from "@/shared/api/core/api-service";

export const getManageUser = async (): Promise<unknown> => {
  return apiGet("/manageUser");
};

export const getBanUser = async (): Promise<unknown> => {
  return apiGet("/banUser");
};

export const getUser = async (): Promise<unknown> => {
  return apiGet("/getUser");
};

export const postManageUser = async (userID: string): Promise<unknown> => {
  return apiPost(`/manageUser/userID=${userID}`);
};

export const searchManageUser = async (keyword: string): Promise<unknown> => {
  return apiGet(`/manageUser/find?find_name=${keyword}`);
};
