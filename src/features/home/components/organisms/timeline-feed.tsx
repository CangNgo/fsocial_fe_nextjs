import { PostList } from "@/features/post";
import type { PostResponse } from "@/shared/types/post";
import { useTimelineStore } from "../../stores/timeline-store";
import StoryList from "./story-list";

interface TimelineFeedProps {
  posts: PostResponse[] | null;
  hasMore: boolean;
  fetchPosts: () => void;
  onCreatePost: () => void;
}

const TimelineFeed = ({ posts, hasMore, fetchPosts, onCreatePost }: TimelineFeedProps) => {
  return (
    <div className="mx-auto w-full max-w-180 space-y-3 flex flex-col items-center px-2 md:pt-2 sm:px-4 sm:pb-0 lg:px-0 lg:pt-3">
      <StoryList createPost={onCreatePost} />
      <PostList
        posts={posts}
        fetchPosts={fetchPosts}
        hasMore={hasMore}
        cardStyle
        store={useTimelineStore}
        scrollContainerId="home-scroll"
      />
    </div>
  );
};

export default TimelineFeed;
