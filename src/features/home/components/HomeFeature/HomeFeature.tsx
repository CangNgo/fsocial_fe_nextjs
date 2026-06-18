"use client";

import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { CreatePostForm } from "@/components/organisms/CreatePostForm";
import { PostList } from "@/components/organisms/PostList";
import { getPosts } from "@/lib/api/posts/postsApi";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { usePopupStore } from "@/store/popupStore";
import { getInitialsFromDisplayName } from "@/utils/combineName";
import { getCookie } from "@/utils/cookie";

export function HomeFeature() {
  const user = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();

  const [posts, setPosts] = useState<any[] | null>(null);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  // Resolve userId: prefer store value, fall back to JWT so we never
  // block on waiting for the profile API to populate the store.
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  useEffect(() => {
    if (user?.userId) {
      setResolvedUserId(user.userId);
      return;
    }
    // Fallback: decode from cookie
    const token = getCookie("access-token");
    if (!token) return;
    try {
      const { sub } = jwtDecode<{ sub: string }>(token);
      if (sub) setResolvedUserId(sub);
    } catch {}
  }, [user?.userId]);

  const handlePostCreated = (post: any) => setPosts((prev) => (prev ? [post, ...prev] : [post]));

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current || !resolvedUserId) return;
    isFetchingRef.current = true;
    const resp = (await getPosts(resolvedUserId, pageRef.current)) as any;
    isFetchingRef.current = false;
    if (!resp || resp.statusCode !== 200) return;
    const newPosts: any[] = resp.data ?? [];
    if (newPosts.length === 0) return;
    setPosts((prev) => (prev ? [...prev, ...newPosts] : newPosts));
    pageRef.current += 1;
  }, [resolvedUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const displayName = user?.displayName ?? "";

  const handleOpenCreatePost = () =>
    showPopup("Tạo bài viết", <CreatePostForm onPostCreated={handlePostCreated} />);

  return (
    <div className="py-4 pb-16 sm:pb-6">
      <div className="mx-auto w-full max-w-[640px] px-2 sm:px-4 lg:px-0 space-y-3">
        {/* Create-post bar */}
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

        {/* Feed */}
        <PostList posts={posts} fetchPosts={fetchPosts} cardStyle />
      </div>
    </div>
  );
}
