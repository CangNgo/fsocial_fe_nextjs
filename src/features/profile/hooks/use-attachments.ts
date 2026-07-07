"use client";

import { useQuery } from "@tanstack/react-query";
import { profileKeys } from "@/services/profile/profile.key";
import { getPictures } from "@/services/profile/attachments-api";

export function useAttachments(userId?: string | null) {
  const query = useQuery({
    queryKey: profileKeys.attachments(userId ?? ""),
    queryFn: () => getPictures({ postId: userId as string, type: "image" }),
    enabled: !!userId,
    select: (resp) => (resp?.statusCode === 200 ? (resp.data ?? []) : []),
  });

  return { pictures: query.data ?? [] };
}
