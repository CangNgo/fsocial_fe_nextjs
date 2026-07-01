import type { TimelinePost } from "@/shared/types/post";

export type ProfilePost = TimelinePost;

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
