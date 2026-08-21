"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

const range = (length: number) => Array.from({ length }, (_, i) => i);

export function ConversationItemSkeleton() {
  return (
    <div className="px-3 py-2.5 h-16 flex items-center gap-3">
      <Skeleton className="size-11 rounded-full" />
      <div className="grow space-y-2">
        <Skeleton className="w-1/2 h-4 rounded-sm" />
        <Skeleton className="h-4 rounded-sm" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="h-full grow overflow-hidden">
      {range(count).map((i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function UserSearchSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {range(count).map((i) => (
        <div key={i} className="px-3 py-2.5 h-16 flex items-center gap-3">
          <Skeleton className="size-11 rounded-full" />
          <Skeleton className="w-1/2 h-4 rounded-sm" />
        </div>
      ))}
    </>
  );
}

// Bong bóng giả xen kẽ trái/phải, chiều rộng thay đổi để giống nhịp hội thoại thật.
const BUBBLES = [
  { self: false, width: "w-40" },
  { self: true, width: "w-28" },
  { self: false, width: "w-56" },
  { self: true, width: "w-44" },
  { self: false, width: "w-32" },
  { self: true, width: "w-52" },
];

export function MessageThreadSkeleton() {
  return (
    <div className="grow min-h-0 overflow-hidden p-4 flex flex-col gap-3">
      {BUBBLES.map((bubble) => (
        <div
          key={`${bubble.self}-${bubble.width}`}
          className={cn("flex items-end gap-2", bubble.self ? "self-end" : "self-start")}
        >
          {!bubble.self && <Skeleton className="size-7 rounded-full shrink-0" />}
          <Skeleton className={cn("h-9 rounded-2xl", bubble.width)} />
        </div>
      ))}
    </div>
  );
}

export function MessageThreadHeaderSkeleton() {
  return (
    <div className="px-4 py-3 border-b flex items-center gap-3">
      <Skeleton className="size-11 rounded-full" />
      <Skeleton className="h-4 w-32 rounded-sm" />
    </div>
  );
}
