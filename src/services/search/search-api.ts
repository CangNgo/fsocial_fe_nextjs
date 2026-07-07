import { apiGet } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { PostResult, UserResult } from "@/shared/types/search";

export const searchUsers = async (keyword: string): Promise<ApiResponse<UserResult[]> | null> => {
  return apiGet<UserResult[]>(`/profile/actions/find?find_name=${keyword}`);
};

export const searchPosts = async (
  keyword: string,
  userId: string,
): Promise<ApiResponse<PostResult[]> | null> => {
  return apiGet<PostResult[]>(`/find?user_id=${userId}&find_post=${keyword}`);
};
