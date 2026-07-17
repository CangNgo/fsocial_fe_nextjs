export interface MediaResponse {
  url: string;
  type: MediaType;
  width: number;
  height: number;
  ratio: number;
  layoutType: MediaLayoutType;
}

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

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video"
}

export enum MediaLayoutType {
  PORTRAIT = "PORTRAIT",
  LANDSCAPE = "LANDSCAPE",
  SQUARE = "SQUARE",
  PANORAMA = "PANORAMA"
}

export interface CreatePost {
  userId: string;
  text: string;
  htmltext: string;
  media: File[];
}