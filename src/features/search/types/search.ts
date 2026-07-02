export type SearchTab = "all" | "users" | "posts";

export interface UserResult {
  userId: string;
  avatar?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  followers?: number;
}

export interface PostResult {
  id: string;
  content?: string;
  [key: string]: unknown;
}

export interface SearchResponse<T> {
  statusCode?: number;
  data?: T[];
}
