import { apiGet } from "@/shared/api/core/api-service";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export const searchUsers = async (keyword: string): Promise<unknown> => {
  return apiGet(`/profile/actions/find?find_name=${keyword}`);
};

export const searchPosts = async (keyword: string): Promise<unknown> => {
  const userId = ownerAccountStore.getState().user?.userId;
  return apiGet(`/post/find?user_id=${userId}&find_post=${keyword}`);
};
