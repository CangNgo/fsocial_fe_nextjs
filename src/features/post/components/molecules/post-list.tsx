"use client";

import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { PostSkeleton } from "@/shared/components/skeletons/post-skeleton";
import { cn } from "@/shared/lib/utils";
import type { PostCardPost, PostCardStore } from "../../hooks/use-post-card-actions";
import PostCard from "./post-card";

interface PostListProps {
  posts: PostCardPost[] | null;
  className?: string;
  fetchPosts?: () => void;
  hasMore?: boolean;
  store?: PostCardStore;
  cardStyle?: boolean;
  /** ID of the scrollable container element (default: "main-scroll") */
  scrollContainerId?: string;
}

export function PostList({
  posts,
  className,
  fetchPosts = () => {},
  hasMore = true,
  store,
  cardStyle = false,
  scrollContainerId = "main-scroll",
}: PostListProps) {
  /* Local optimistic overrides so actions (eg. like) reflect instantly when the
   * list isn't backed by a Zustand store that owns the post data. */
  const [overrides, setOverrides] = useState<Record<string, Partial<PostCardPost>>>({});
  const safeData = (posts ?? []).map((post) =>
    overrides[post.id] ? { ...post, ...overrides[post.id] } : post,
  );

  const setPostOverride = useCallback(
    (postId: string): Dispatch<SetStateAction<PostCardPost>> =>
      (value) =>
        setOverrides((prev) => {
          const current = { ...(posts?.find((item) => item.id === postId) ?? {}), ...prev[postId] };
          const next =
            typeof value === "function"
              ? (value as (p: PostCardPost) => PostCardPost)(current as PostCardPost)
              : value;
          return { ...prev, [postId]: { ...prev[postId], ...next } };
        }),
    [posts],
  );

  /* Find the scrollable container after mount */
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.getElementById(scrollContainerId);
    if (el) {
      queueMicrotask(() => {
        setScrollParent(el);
      });
    }
  }, [scrollContainerId]);

  if (!posts) {
    return (
      <div className="space-y-3">
        {["a", "b", "c"].map((skeletonKey) => (
          <PostSkeleton key={skeletonKey} card={cardStyle} />
        ))}
      </div>
    );
  }

  if (safeData.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-12">Chưa có bài viết nào</p>;
  }

  return (
    <Virtuoso
      customScrollParent={scrollParent ?? undefined}
      data={safeData}
      computeItemKey={(index) => `${index}`}
      increaseViewportBy={{ top: 1200, bottom: 600 }}
      itemContent={(_, post) => (
        <div className={cardStyle ? "mb-3" : ""}>
          <PostCard
            post={post}
            setPost={setPostOverride(post.id)}
            className={cn(
              "bg-background",
              cardStyle ? "rounded-xl border shadow-sm overflow-hidden" : cn("border-b", className),
            )}
            store={store}
          />
        </div>
      )}
      components={{
        Footer: () => (hasMore ? <PostSkeleton card={cardStyle} /> : null),
      }}
      endReached={() => {
        if (hasMore) fetchPosts();
      }}
    />
  );
}
