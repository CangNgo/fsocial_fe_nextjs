"use client";

import { useCallback } from "react";
import CreatePostForm from "@/shared/components/organisms/create-post-form";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useTimeline } from "../../hooks/use-timeline";
import TimelineFeed from "../organisms/timeline-feed";

export default function Timeline() {
  const { showPopup } = usePopupStore();
  const { posts, hasMore, fetchPosts, handlePostCreated } = useTimeline();

  const handleOpenCreatePost = useCallback(() => {
    showPopup("Tạo bài viết", <CreatePostForm onPostCreated={handlePostCreated} />);
  }, [handlePostCreated, showPopup]);

  return (
    <div className="sm:pb-6">
      <TimelineFeed
        posts={posts}
        hasMore={hasMore}
        fetchPosts={fetchPosts}
        onCreatePost={handleOpenCreatePost}
      />
    </div>
  );
}
