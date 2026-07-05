"use client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getPost } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import type { PostResponse } from "@/shared/types/post";

interface GetPostResponse {
  statusCode?: number;
  data?: PostResponse;
}

const messageNotFoundPost = "Không tìm thấy bài viết";

export default function PostFeature() {
  const params = useParams<{ id: string }>();
  const postId = params?.id ?? "";
  const user = ownerAccountStore((state) => state.user);
  const [posts, setPosts] = useState<PostResponse[] | null>(null);

  const handleGetPost = useCallback(async () => {
    if (!user.id || !postId) return;
    const resp = (await getPost(user.id, postId)) as GetPostResponse | null;
    if (resp?.statusCode !== 200 || !resp.data) {
      setPosts([]);
      return;
    }
    setPosts([resp.data]);
  }, [postId, user.id]);

  useEffect(() => {
    if (user.id) {
      queueMicrotask(() => {
        handleGetPost();
      });
    }
  }, [user.id, handleGetPost]);

  return (
    <div className="bg-background flex flex-grow transition">
      <div className="overflow-y-auto scrollable-div w-full">
        <div
          className="
            w-full mx-auto
            lg:max-w-[540px]
            md:space-y-4 md:pb-0
            sm:mt-0
            space-y-1.5 pb-12"
        >
          {posts && posts.length > 0 && postId === posts[0]?.id && (
            <div className="mt-2 sm:rounded shadow-y border p-4">
              <p>{posts[0].content as string}</p>
            </div>
          )}

          {posts?.length === 0 && (
            <p className="my-4 text-center text-gray">{messageNotFoundPost}</p>
          )}
        </div>
      </div>
    </div>
  );
}
