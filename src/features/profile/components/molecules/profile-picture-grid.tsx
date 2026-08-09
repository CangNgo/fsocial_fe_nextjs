import { Image } from "@/shared/components/atoms/image";
import type { AttachmentMediaResponse } from "@/shared/types/attachments";
import { MediaType } from "@/shared/types/post";
import { Play } from "lucide-react";
import { useState } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";

interface ProfilePictureGridProps {
  pictures: AttachmentMediaResponse[];
  fetchPictures?: () => void;
  hasMorePictures?: boolean;
}

export function ProfilePictureGrid({
  pictures,
  fetchPictures = () => { },
  hasMorePictures,
}: ProfilePictureGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <VirtuosoGrid
        className="col-span-3"
        listClassName="grid grid-cols-3 gap-[1px]"
        data={pictures}
        computeItemKey={(_, picture) => picture.id}
        endReached={() => {
          if (hasMorePictures) fetchPictures();
        }}
        itemContent={(index, picture) => {
          const isVideo = picture.resourceType === MediaType.VIDEO;
          return (
            <button
              type="button"
              className="relative aspect-square w-full overflow-hidden"
              onClick={() => setLightboxIndex(index)}
            >
              {isVideo ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={picture.url}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  preload="metadata"
                  muted
                />
              ) : (
                <Image
                  src={picture.url}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 33vw, 210px"
                  className="object-cover object-center"
                />
              )}
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="size-8 fill-white stroke-white" />
                </div>
              )}
            </button>
          );
        }}
      />

      <Lightbox
        open={lightboxIndex !== null}
        close={() => setLightboxIndex(null)}
        index={lightboxIndex ?? 0}
        plugins={[Video]}
        video={{ autoPlay: true }}
        slides={pictures.map((picture) =>
          picture.resourceType === MediaType.VIDEO
            ? { type: "video" as const, sources: [{ src: picture.url, type: "video/mp4" }] }
            : { src: picture.url },
        )}
      />
    </>
  );
}
