"use client";

import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPosts } from "@/shared/api/posts/posts-api";
import { CreatePostForm } from "@/shared/components/organisms/create-post-form/create-post-form";
import { PostList } from "@/shared/components/organisms/post-list/post-list";
import { ownerAccountStore, type User } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { getCookie } from "@/shared/utils/cookie";
import StoryList from "../organisms/story-list";

export default function Timeline() {
  const user: User = ownerAccountStore((state) => state.user);
  const { showPopup } = usePopupStore();

  const [posts, setPosts] = useState<any[] | null>(null);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  useEffect(() => {
    if (user?.userId) {
      setResolvedUserId(user.userId);
      return;
    }
    const token = getCookie("access-token");
    if (!token) return;
    try {
      const { sub } = jwtDecode<{ sub: string }>(token);
      if (sub) setResolvedUserId(sub);
    } catch { }
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

  const handleOpenCreatePost = () =>
    showPopup("Tạo bài viết", <CreatePostForm onPostCreated={handlePostCreated} />);

  return (
    <div className="sm:pb-6">
      <div className="mx-auto w-full max-w-[640px] px-2 sm:px-4 lg:px-0 space-y-3 lg:pt-3 md:pt-2">
        {/* Create-post bar */}
        <StoryList createPost={handleOpenCreatePost} />
        {/* Feed */}
        <PostList posts={posts} fetchPosts={fetchPosts} cardStyle />
      </div>
    </div>
  );
}
