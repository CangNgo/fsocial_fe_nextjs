import { apiGet } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { SearchPageResponse, PostResult, UserResult } from "@/shared/types/search";

const SEARCH_PAGE_SIZE = 10;

export const searchUsers = async (
  keyword: string,
  page = 0,
): Promise<ApiResponse<SearchPageResponse<UserResult>> | null> => {
  return apiGet<SearchPageResponse<UserResult>>(
    `/account/search?q=${encodeURIComponent(keyword)}&page=${page}&size=${SEARCH_PAGE_SIZE}`,
  );
};

export const searchPosts = async (
  keyword: string,
  page = 0,
): Promise<ApiResponse<SearchPageResponse<PostResult>> | null> => {
  return apiGet<SearchPageResponse<PostResult>>(
    `/actions/find?find_post=${encodeURIComponent(keyword)}&page=${page}&size=${SEARCH_PAGE_SIZE}`,
  );
};
