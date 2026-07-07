import type { PostResponse } from "@/shared/types/post";

export type ProfilePost = PostResponse;

export interface ProfilePostsResponse {
  statusCode?: number;
  data?: ProfilePost[];
}

export interface ProfileFollower {
  userId?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ProfileFollowersResponse {
  statusCode?: number;
  data?: ProfileFollower[];
}
