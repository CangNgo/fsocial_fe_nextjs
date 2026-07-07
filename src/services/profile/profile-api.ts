import { apiDelete, apiGet } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { AccountResponse } from "@/shared/types/profile";

export async function getOwnerProfile(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet<AccountResponse>("/profile");
}

export async function getProfile(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet(`/profile?userId=${userId}`);
}

export async function requestFollow(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet(`/profile/follow/${userId}`);
}

export async function unfollow(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiDelete(`/profile/follow/${userId}`);
}

export async function getFollowers(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet("/profile/follow/followers");
}

export async function getFollowing(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet("/profile/follow/following");
}
