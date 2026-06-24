"use client";

import { Skeleton } from "../ui/skeleton";
import { cn } from "../../lib/utils";

export function PostSkeleton({ card }: { card?: boolean }) {
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