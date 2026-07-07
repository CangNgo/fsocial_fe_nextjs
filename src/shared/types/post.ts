import type { MediaResponse } from "./media";

export interface PostContent {
  text?: string;
  html?: string;
  htmltext?: string;
  media?: MediaResponse[];
}

export interface PostResponse {
  id: string;
  userId: string;
  originPostId: string | null;
  content: PostContent;
  countLikes: number;
  countComments: number;
  displayName: string;
  avatar: string | null;
  createDatetime: string;
  share: boolean;
  like: boolean;
  status: boolean;
  tags: string[];
}

export interface PostsResponse {
  statusCode?: number;
  data?: PostResponse[];
}
