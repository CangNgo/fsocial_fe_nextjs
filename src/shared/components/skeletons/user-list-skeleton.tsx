import { Skeleton } from "../ui/skeleton";

export function UserListSkeleton() {
  return [0, 1, 2, 3, 4].map((item) => (
    <div key={item} className="py-3 flex items-center gap-3 border-b">
      <Skeleton className="size-12 rounded-full" />
      <div className="space-y-1 flex-grow">
        <Skeleton className="w-32 h-4 rounded-sm" />
        <Skeleton className="w-24 h-4 rounded-sm" />
      </div>
    </div>
  ));
}
