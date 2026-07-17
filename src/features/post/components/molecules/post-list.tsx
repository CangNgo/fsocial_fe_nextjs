"use client";

import { PostSkeleton } from "@/shared/components/skeletons/post-skeleton";
import { cn } from "@/shared/lib/utils";
import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import type { PostCardPost, PostCardStore } from "../../hooks/use-post-card-actions";
import PostCard from "./post-card";

interface PostListProps {
  posts: PostCardPost[] | null;
  className?: string;
  fetchPosts?: () => void;
  hasMore?: boolean;
  store?: PostCardStore;
  cardStyle?: boolean;
  scrollContainerId?: string;
}

export function PostList({
  posts,
  className,
  fetchPosts = () => { },
  hasMore = true,
  store,
  cardStyle = false,
  scrollContainerId = "main-scroll",
}: PostListProps) {

  // /* Find the scrollable container after mount */
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
      <div className="space-y-3 max-w-160 w-full">
        {[1, 2, 3].map((skeletonKey) => (
          <PostSkeleton key={skeletonKey} card={cardStyle} />
        ))}
      </div>
    );
  }

  return (
    <Virtuoso
      className="max-w-160 w-full h-full"
      customScrollParent={scrollParent ?? undefined}
      data={posts}
      computeItemKey={(index) => `${index}`}
      increaseViewportBy={{ top: 1200, bottom: 600 }}
      itemContent={(index, post) => (
        <div className={cardStyle ? "mb-3" : ""}>
          <PostCard
            post={post}
            priority={index === 0}
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
