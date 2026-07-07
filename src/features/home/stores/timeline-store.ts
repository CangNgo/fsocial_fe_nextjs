import { create } from "zustand";
import type { PostResponse } from "@/shared/types/post";

interface TimelineStoreState {
  updatePost: (id: string, values: Partial<PostResponse>) => void;
  deletePost: (id: string) => void;
}

export const useTimelineStore = create<TimelineStoreState>()(() => ({
  updatePost: () => {},
  deletePost: () => {},
}));

export const timelineStore = useTimelineStore;
