export interface AttachmentsRequest {
  postId: string;
  type?: string;
}

export interface AttachmentsResponse {
  id: string;
  url: string;
  type: "image" | "video";
  postId: string;
}
