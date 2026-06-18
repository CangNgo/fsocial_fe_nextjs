export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  dateTime: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
