import { PostSkeleton } from "@/shared/components/skeletons/post-skeleton";
import { Skeleton } from "@/shared/components/ui/skeleton";

const STORY_KEYS = ["a", "b", "c", "d", "e", "f"];
const POST_KEYS = ["a", "b", "c"];

const TimelineSkeleton = () => {
  return (
    <div className="sm:pb-6">
      <div className="mx-auto w-full max-w-160 space-y-3 px-2 md:pt-2 sm:px-4 sm:pb-0 lg:px-0 lg:pt-3">
        <div className="flex gap-2 h-40 w-full">
          {STORY_KEYS.map((storyKey) => (
            <Skeleton key={storyKey} className="w-1/6 h-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {POST_KEYS.map((postKey) => (
            <PostSkeleton key={postKey} card />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineSkeleton;
