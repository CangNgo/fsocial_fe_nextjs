"use client";

import { PostList } from "@/features/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import { useFollowTimeline } from "../../hooks/use-follow-timeline";

export default function FollowFeature() {
  const { user, posts, fetchPosts, hasMore, handleOpenCreatePost } = useFollowTimeline();
  const displayName = user?.displayName ?? "";

  return (
    <div className="py-4 pb-16 sm:pb-6">
      <div className="mx-auto w-full max-w-[640px] px-2 sm:px-4 lg:px-0 space-y-3">
        <Button
          type="button"
          className="bg-background rounded-xl border shadow-sm px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-accent/30 transition-colors w-full text-left"
          onClick={handleOpenCreatePost}
        >
          <Avatar className="size-9 flex-shrink-0">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-[11px] font-medium">
              {getInitialsFromDisplayName(user?.displayName ?? "")}
            </AvatarFallback>
          </Avatar>
          <span className="flex-1 text-sm text-muted-foreground select-none">
            {displayName ? `${displayName}, bạn đang nghĩ gì?` : "Bạn đang nghĩ gì?"}
          </span>
        </Button>
        <PostList posts={posts} fetchPosts={fetchPosts} hasMore={hasMore} cardStyle />
      </div>
    </div>
  );
}
