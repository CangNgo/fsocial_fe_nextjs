import type { PostResponse } from "@/shared/types/post";

export type SearchTab = "posts" | "users";

export interface SearchPageResponse<T> {
  items: T[];
  page: number;
  size: number;
  hasMore: boolean;
}

export interface UserResult {
  id: string;
  username?: string;
  avatar?: string | null;
  displayName?: string;
  bio?: string | null;
  follower?: string[];
}

export type PostResult = PostResponse;
