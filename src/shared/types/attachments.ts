import type { MediaType } from "@/shared/types/post";

export interface AttachmentsRequest {
  lastItemId: string;
  createdAt?: string;
  resourceType?: string;
}

export interface AttachmentsResponse {
  id: string;
  url: string;
  type: MediaType;
  postId: string;
}
export interface AttachmentMediaResponse {
  id: string;
  publicId: string;
  url: string;
  resourceType: string;
  fileType: string;
  size: string;
  ownerId: string;
  postId: string;
  ord: number;
  width: number;
  height: number;
  type: MediaType;
  createdAt: string;
}