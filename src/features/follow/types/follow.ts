import type { TimelinePost } from "@/shared/types/post";

export type FollowPost = TimelinePost;

export interface FollowPostsResponse {
  statusCode?: number;
  data?: FollowPost[];
}
