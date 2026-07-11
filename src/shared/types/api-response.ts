export interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data?: T;
}

export interface InfinityResponse<T> {
  items: T,
  nextCursor?: string | null;
  hasMore?: boolean;
}