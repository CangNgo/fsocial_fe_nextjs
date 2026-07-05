"use client";

import { useEffect, useMemo, useState } from "react";
import { getPost } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

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
  const [post, setPost] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const found = storeApi?.getState?.()?.findPost?.(id);
    if (found) {
      queueMicrotask(() => {
        setPost(found as Record<string, unknown>);
      });
      return;
    }

    getPost(user.id ?? "", id).then((resp: unknown) => {
      const response = resp as { statusCode?: number; data?: unknown };
      if (response?.statusCode === 200) setPost(response.data as Record<string, unknown>);
    });
  }, [user.id, storeApi, id]);

  const updateStoredPost = (props: unknown) => {
    storeApi?.getState?.()?.updatePost?.(id, props);
  };

  return { post, setPost, updateStoredPost };
}
