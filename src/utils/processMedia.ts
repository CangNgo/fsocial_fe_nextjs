import { regexImage, regexVideo } from "@/config/regex";

export interface ProcessedMedia {
  src: string;
  type: "image" | "video" | "post";
}

export const processMedias = (post: {
  content?: { media?: string[] };
  originPostId?: string;
}): ProcessedMedia[] => {
  if (post.content?.media) {
    return post.content.media.map((media) => {
      let type: "image" | "video" = "image";
      if (regexImage.test(media)) type = "image";
      else if (regexVideo.test(media)) type = "video";
      return { src: media, type };
    });
  }
  if (post.originPostId) {
    return [{ src: post.originPostId, type: "post" }];
  }
  return [];
};
