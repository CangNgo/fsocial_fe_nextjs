import { useTimelineStore } from "../store/timeline-store";

export interface PostContent {
  text?: string;
  html?: string;
  htmltext?: string;
  media?: MediaResponse[];
}

export interface TimelinePost {
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
  data?: TimelinePost[];
}
export interface MediaResponse {
  url: string;
  type: MediaType;
  width: number;
  height: number;
}

export interface LayoutSlot {
  media: MediaResponse;
  colSpan: number;
  rowSpan: number;
  height: number;
  showMore?: number;
}

export interface GridLayout {
  totalCols: number;
  gap: number;
  slots: LayoutSlot[];
  debugLabel: string;
}

export type AspectType = "portrait" | "square" | "landscape" | "panorama";

export enum MediaType {
  IMAGE,
  VIDEO
}

export const selectTimelineState = (state: ReturnType<typeof useTimelineStore.getState>) => ({
  posts: state.posts,
  hasMore: state.hasMore,
  page: state.page,
  isFetching: state.isFetching,
  prependPost: state.prependPost,
  appendPosts: state.appendPosts,
  setHasMore: state.setHasMore,
  setIsFetching: state.setIsFetching,
  incrementPage: state.incrementPage,
  reset: state.reset,
});