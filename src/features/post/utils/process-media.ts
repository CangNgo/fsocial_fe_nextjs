import { type MediaResponse, MediaType } from "@/shared/types/media";

export interface ProcessedMedia {
  src: string;
  type: "image" | "video" | "post";
}

export const processMedias = (post: {
  content?: { media?: MediaResponse[] };
  originPostId?: string;
}): ProcessedMedia[] => {
  if (post.content?.media) {
    return post.content.media.map(({ url, type }) => ({
      src: url,
      type: type === MediaType.VIDEO ? "video" : "image",
    }));
  }
  if (post.originPostId) {
    return [{ src: post.originPostId, type: "post" }];
  }
  return [];
};
