"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPost } from "@/lib/api/posts/postsApi";
import { ownerAccountStore } from "@/store/ownerAccountStore";

const messageNotFoundPost = "Không tìm thấy bài viết";

interface Post {
  id: string;
  content?: string;
  [key: string]: unknown;
}

export function PostFeature() {
  const params = useParams<{ id: string }>();
  const postId = params?.id ?? "";
  const user = ownerAccountStore((state) => state.user);
  const [posts, setPosts] = useState<Post[] | null>(null);

  const handleGetPost = async () => {
    if (!user?.userId || !postId) return;
    const resp = (await getPost(user.userId, postId)) as any;
    if (!resp || resp.statusCode !== 200) {
      setPosts([]);
      return;
    }
    setPosts([resp.data]);
  };

  useEffect(() => {
    if (user?.userId) handleGetPost();
  }, [user?.userId, handleGetPost]);

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
