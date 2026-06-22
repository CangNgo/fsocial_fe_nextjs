"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getFollowingPosts } from "@/shared/api/posts/posts-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { Button } from "@/shared/components/atoms/button";
import { CreatePostForm } from "@/shared/components/organisms/create-post-form/create-post-form";
import { PostList } from "@/shared/components/organisms/post-list/post-list";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

export default function FollowFeature() {
  const user = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();

  const [posts, setPosts] = useState<any[] | null>(null);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const handlePostCreated = (post: any) => setPosts((prev) => (prev ? [post, ...prev] : [post]));

  // getFollowingPosts uses JWT from the request header, no userId param needed
  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const resp = (await getFollowingPosts(pageRef.current)) as any;
    isFetchingRef.current = false;
    if (!resp || resp.statusCode !== 200) return;
    const newPosts: any[] = resp.data ?? [];
    if (newPosts.length === 0) return;
    setPosts((prev) => (prev ? [...prev, ...newPosts] : newPosts));
    pageRef.current += 1;
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const displayName = user?.displayName ?? "";

  const handleOpenCreatePost = () =>
    showPopup("Tạo bài viết", <CreatePostForm onPostCreated={handlePostCreated} />);

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
        <PostList posts={posts} fetchPosts={fetchPosts} cardStyle />
      </div>
    </div>
  );
}
