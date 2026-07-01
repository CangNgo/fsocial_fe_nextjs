import type { useTimelineStore } from "../store/timeline-store";
export type {
  AspectType,
  GridLayout,
  LayoutSlot,
  MediaResponse,
} from "@/shared/types/media";
export { MediaType } from "@/shared/types/media";
export type { PostContent, PostsResponse, TimelinePost } from "@/shared/types/post";

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
