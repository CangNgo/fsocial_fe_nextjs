import { Image } from "@/shared/components/atoms/image";
import type { AttachmentsResponse } from "@/shared/types/attachments";

interface ProfilePictureGridProps {
  pictures: AttachmentsResponse[];
}

export function ProfilePictureGrid({ pictures }: ProfilePictureGridProps) {
  return (
    <>
      {pictures.map((picture) => (
        <div key={picture.url} className="relative aspect-square w-full overflow-hidden">
          <Image
            src={picture.url}
            alt=""
            fill
            sizes="(max-width: 1024px) 33vw, 210px"
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="col-span-3 text-center text-gray-light mt-32">
        Tính năng đang phát triển
      </div>
    </>
  );
}
