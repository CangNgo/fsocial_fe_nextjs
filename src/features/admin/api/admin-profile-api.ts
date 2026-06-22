import { apiGet } from "@/shared/api/core/api-service";

export const getAdminProfile = async (userId: string): Promise<unknown> => {
  return apiGet(`/profile/profile-admin/${userId}`);
};
