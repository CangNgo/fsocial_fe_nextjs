import { create } from "zustand";
import type { PostResponse } from "@/shared/types/post";

interface TimelineStoreState {
  posts: PostResponse[] | null;
  hasMore: boolean;
  page: number;
  isFetching: boolean;
  prependPost: (post: PostResponse) => void;
  appendPosts: (posts: PostResponse[]) => void;
  setHasMore: (value: boolean) => void;
  setIsFetching: (value: boolean) => void;
  incrementPage: () => void;
  reset: () => void;
  findPost: (id: string) => PostResponse | undefined;
  updatePost: (id: string, values: Partial<PostResponse>) => void;
  deletePost: (id: string) => void;
}

export const useTimelineStore = create<TimelineStoreState>()((set, get) => ({
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
  findPost: (id) => get().posts?.find((post) => post.id === id),
  updatePost: (id, values) =>
    set((state) => ({
      posts:
        state.posts?.map((post) =>
          post.id === id
            ? {
                ...post,
                ...values,
                content: values.content ? { ...post.content, ...values.content } : post.content,
              }
            : post,
        ) ?? null,
    })),
  deletePost: (id) =>
    set((state) => ({
      posts: state.posts?.filter((post) => post.id !== id) ?? null,
    })),
}));

export const timelineStore = useTimelineStore;
