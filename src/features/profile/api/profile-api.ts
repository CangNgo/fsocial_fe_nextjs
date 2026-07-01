import { apiDelete, apiGet } from "@/shared/api/core/api-service";
import { ApiResponse } from "@/shared/types/api-response";
import { AccountResponse } from "@/shared/types/profile";

export async function getOwnerProfile(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet<AccountResponse>("/post/profile");
}

export async function getProfile(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet(`/post/profile?userId=${userId}`);
}

export async function requestFollow(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet(`/post/profile/follow/${userId}`);
}

export async function unfollow(userId: string): Promise<ApiResponse<AccountResponse> | null> {
  return apiDelete(`/post/profile/follow/${userId}`);
}

export async function getFollowers(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet("/post/profile/follow/followers");
}

export async function getFollowing(): Promise<ApiResponse<AccountResponse> | null> {
  return apiGet("/post/profile/follow/following");
}
