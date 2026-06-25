import { create } from "zustand";

interface TimelineStoreState {
  posts: any[] | null;
  hasMore: boolean;
  page: number;
  isFetching: boolean;
  prependPost: (post: any) => void;
  appendPosts: (posts: any[]) => void;
  setHasMore: (value: boolean) => void;
  setIsFetching: (value: boolean) => void;
  incrementPage: () => void;
  reset: () => void;
}

export const useTimelineStore = create<TimelineStoreState>()((set) => ({
  posts: null,
  hasMore: true,
  page: 0,
  isFetching: false,
  prependPost: (post) => set((state) => ({ posts: state.posts ? [post, ...state.posts] : [post] })),
  appendPosts: (posts) =>
    set((state) => ({
      posts: state.posts ? [...state.posts, ...posts] : posts,
    })),
  setHasMore: (value) => set({ hasMore: value }),
  setIsFetching: (value) => set({ isFetching: value }),
  incrementPage: () => set((state) => ({ page: state.page + 1 })),
  reset: () => set({ posts: null, hasMore: true, page: 0, isFetching: false }),
}));

export const timelineStore = useTimelineStore;
