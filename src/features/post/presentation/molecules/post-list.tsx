"use client";

import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { PostSkeleton } from "@/shared/components/skeletons/post-skeleton";
import { cn } from "@/shared/lib/utils";
import PostCard from "./post-card";

interface PostListProps {
  posts: any[] | null;
  className?: string;
  fetchPosts?: () => void;
  hasMore?: boolean;
  store?: any;
  cardStyle?: boolean;
  /** ID of the scrollable container element (default: "main-scroll") */
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
  const safeData = posts ?? [];

  /* Find the scrollable container after mount */
  const [scrollParent, setScrollParent] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const el = document.getElementById(scrollContainerId);
    if (el) setScrollParent(el);
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
      computeItemKey={(index, post) => post?.id ?? `${index}`}
      increaseViewportBy={{ top: 1200, bottom: 600 }}
      itemContent={(_, post) => (
        <div className={cardStyle ? "mb-3" : ""}>
          <PostCard
            post={post}
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
      rangeChanged={({ endIndex }) => {
        if (hasMore && endIndex >= safeData.length - 5) fetchPosts();
      }}
    />
  );
}
