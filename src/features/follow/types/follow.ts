import type { PostResponse } from "@/shared/types/post";

export type FollowPost = PostResponse;

export interface FollowPostsResponse {
  statusCode?: number;
  data?: FollowPost[];
}
