"use client";

import { getAttachmentImage } from "@/services/profile/attachments-api";
import { profileKeys } from "@/services/profile/profile.key";
import type { AttachmentsRequest } from "@/shared/types/attachments";
import { useInfiniteQuery } from "@tanstack/react-query";

const INITIAL_CURSOR: AttachmentsRequest = { lastItemId: "", createdAt: "" };

export const PICTURES_TAB_INDEX = 1;
export const VIDEOS_TAB_INDEX = 2;

export function useProfileImage(resourceType: string, currentTab: number | null, tabIndex: number) {
  const query = useInfiniteQuery({
    queryKey: profileKeys.attachmentImage(resourceType),
    queryFn: ({ pageParam }) => getAttachmentImage({ ...(pageParam as AttachmentsRequest), resourceType }),
    initialPageParam: INITIAL_CURSOR,
    getNextPageParam: (lastPage) => {
      const items = lastPage?.data?.items ?? [];
      const last = items[items.length - 1];
      if (!lastPage?.data?.hasMore || !last) return undefined;
      return { lastItemId: last.id, createdAt: last.createdAt, resourceType } satisfies AttachmentsRequest;
    },
    enabled: currentTab === tabIndex,
  });

  const pictures = query.data ? query.data.pages.flatMap((page) => page?.data?.items ?? []) : [];

  return {
    pictures,
    fetchPictures: () => query.fetchNextPage(),
    hasMorePictures: query.hasNextPage,
  };
}
