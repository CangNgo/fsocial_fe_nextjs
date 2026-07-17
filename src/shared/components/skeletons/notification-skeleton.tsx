import { Skeleton } from "@/shared/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-2 ps-4 py-2 mb-1">
      <Skeleton className="size-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}
