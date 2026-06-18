import { apiDelete, apiGet } from "../apiService";

export async function getOwnerProfile(signal?: AbortSignal): Promise<unknown> {
  return apiGet("/post/profile", signal ? { signal } : undefined, {});
}

export async function getProfile(userId: string): Promise<unknown> {
  return apiGet(`/post/profile?userId=${userId}`);
}

export async function requestFollow(userId: string): Promise<unknown> {
  return apiGet(`/post/profile/follow/${userId}`);
}

export async function unfollow(userId: string): Promise<unknown> {
  return apiDelete(`/post/profile/follow/${userId}`);
}

export async function getFollowers(): Promise<unknown> {
  return apiGet("/post/profile/follow/followers");
}

export async function getFollowing(): Promise<unknown> {
  return apiGet("/post/profile/follow/following");
}
