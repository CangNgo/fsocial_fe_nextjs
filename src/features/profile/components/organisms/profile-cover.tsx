import { PencilChangeImageIcon } from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type React from "react";

interface ProfileCoverProps {
  background?: string | null;
  isOwner: boolean;
  onSelectBackground: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileCover({ background, isOwner, onSelectBackground }: ProfileCoverProps) {
  return (
    <div
      className={cn(
        "relative sm:mt-5 mt-2 aspect-[2/1] overflow-hidden lg:rounded-lg border",
        !background && "border-field",
      )}
    >
      {background ? (
        <Image
          src={background}
          alt="Ảnh bìa"
          fill
          sizes="(max-width: 1024px) 100vw, 630px"
          className="object-cover object-center"
        />
      ) : (
        isOwner && (
          <div className="size-full grid place-content-center">
            <p>Cập nhật ảnh bìa của bạn</p>
          </div>
        )
      )}
      {isOwner && (
        <label
          htmlFor="profile-banner-upload"
          className="btn-secondary w-fit absolute bottom-2 right-2 py-1 ps-2.5 pe-4 border cursor-pointer"
        >
          <PencilChangeImageIcon />
          Đổi ảnh bìa
          <Input
            id="profile-banner-upload"
            type="file"
            hidden
            onChange={onSelectBackground}
            onClick={(e: React.MouseEvent<HTMLInputElement>) => {
              (e.target as HTMLInputElement).value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
