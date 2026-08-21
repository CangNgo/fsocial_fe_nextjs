export type FaqType = "FAQ" | "TUTORIAL" | "ABOUT_US";

export interface FaqResponse {
  id: string;
  name: string;
  description?: string | null;
  content: string;
  type: FaqType;
  attachmentId?: string | null;
  viewCount: number;
  ratingCount: number;
  averageRating: number;
}

export interface FaqPayload {
  name: string;
  description?: string | null;
  content: string;
  type: FaqType;
  attachmentId?: string | null;
}
