import { apiGet } from "../apiService";

export const getAdminProfile = async (userId: string): Promise<unknown> => {
  return apiGet(`/profile/profile-admin/${userId}`);
};
