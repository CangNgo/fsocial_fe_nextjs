"use client";

import { useEffect, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { Skeleton } from "@/components/atoms/skeleton";
import { PostCard } from "@/components/organisms/PostCard";
import { cn } from "@/lib/utils";

interface PostListProps {
  posts: any[] | null;
  className?: string;
  fetchPosts?: () => void;
  store?: any;
  cardStyle?: boolean;
  /** ID of the scrollable container element (default: "main-scroll") */
  scrollContainerId?: string;
}

function PostSkeleton({ card }: { card?: boolean }) {
  return (
    <div
      className={cn(
        "bg-background animate-pulse",
        card ? "rounded-xl border shadow-sm overflow-hidden mb-3" : "border-b",
      )}
    >
      <div className="px-4 pt-4 pb-3 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <Skeleton className="h-3.5 w-3/4 rounded" />
      </div>
      <Skeleton className="w-full h-48" />
    </div>
  );
}

export function PostList({
  posts,
  className,
  fetchPosts = () => {},
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
        Footer: () => <PostSkeleton card={cardStyle} />,
      }}
      rangeChanged={({ endIndex }) => {
        if (endIndex >= safeData.length - 5) fetchPosts();
      }}
    />
  );
}
