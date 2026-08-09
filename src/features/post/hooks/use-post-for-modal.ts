"use client";

import { getPost } from "@/services/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { PostResponse } from "@/shared/types/post";
import { useEffect, useMemo, useState } from "react";

interface PostModalStoreState {
  findPost?: (id: string) => unknown;
  updatePost?: (id: string, props: unknown) => void;
}

export interface PostModalStore {
  getState?: () => PostModalStoreState;
}

interface UsePostForModalOptions {
  id: string;
  store?: unknown;
}

export function usePostForModal({ id, store }: UsePostForModalOptions) {
  const user = ownerAccountStore.getState().user;
  const storeApi = useMemo(() => store as PostModalStore | undefined, [store]);
  const [post, setPost] = useState<PostResponse | null>(null);

  useEffect(() => {
    const found = storeApi?.getState?.()?.findPost?.(id);
    if (found) {
      queueMicrotask(() => {
        setPost(found as PostResponse);
      });
      return;
    }
    const fetchPost = async () => {
      const res = await getPost(user.id ?? "", id)
      setPost(res?.data as PostResponse);
    }

    fetchPost()

  }, [user.id, storeApi, id]);

  const updateStoredPost = (props: unknown) => {
    storeApi?.getState?.()?.updatePost?.(id, props);
  };

  return { post, setPost, updateStoredPost };
}
