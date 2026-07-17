import { PencilChangeImageIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ReportModal } from "@/shared/components/organisms/report-modal";
import { usePopupStore } from "@/shared/stores/popup-store";
import { Ellipsis, MessageSquareWarning } from "lucide-react";
import Link from "next/link";
import { createElement } from "react";
import type React from "react";
import { userProfileOptions } from "../../config/user-profile-options";
import { ProfileFollowerPreview } from "../molecules/profile-follower-preview";

interface ProfileHeaderProps {
  userId?: string | null;
  avatar?: string | null;
  displayName?: string;
  followers?: string[];
  isOwner: boolean;
  isFollowing?: boolean;
  onSelectAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onViewFollowers: () => void;
  onRequestFollow: () => void;
  onUnfollow: () => void;
}

export function ProfileHeader({
  userId,
  avatar,
  displayName,
  followers,
  isOwner,
  isFollowing,
  onSelectAvatar,
  onViewFollowers,
  onRequestFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  const { showPopup } = usePopupStore();

  const handleReportUser = () => {
    if (!userId) return;
    showPopup(
      "Báo cáo vi phạm",
      createElement(ReportModal, { targetId: userId, complaintType: "ACCOUNT" }),
    );
  };
  return (
    <div className="flex sm:flex-row sm:items-start flex-col items-center gap-4 sm:px-3 px-1">
      <div className="relative bg-background border-4 rounded-full p-1 mt-3 w-fit transition">
        <UserAvatar src={avatar} displayName={displayName} className="size-30" />
        {isOwner && (
          <label
            htmlFor="profile-avatar-upload"
            className="btn-secondary w-fit absolute bottom-0 right-0 p-1 rounded-full shadow border cursor-pointer"
          >
            <Input
              id="profile-avatar-upload"
              type="file"
              hidden
              onChange={onSelectAvatar}
              onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                (e.target as HTMLInputElement).value = "";
              }}
            />
            <PencilChangeImageIcon />
          </label>
        )}
      </div>

      <div className="flex-grow sm:self-center sm:block sm:px-0 sm:pt-5 px-4 flex flex-col items-center">
        <h3 className="line-clamp-2">{displayName ?? ""}</h3>
        <p>{followers?.length} người theo dõi</p>
        <ProfileFollowerPreview followers={followers} onViewAll={onViewFollowers} />
      </div>

      <div className="self-center flex gap-4">
        <Popover>
          <PopoverTrigger className="btn-secondary aspect-square h-10 border">
            <Ellipsis className="size-5" />
          </PopoverTrigger>
          <PopoverContent className="bg-background p-1.5 w-64">
            {userProfileOptions[isOwner ? "OWNER" : "OTHER"].map((item) => (
              <Button
                key={item.to}
                asChild
                variant="ghost"
                className="btn-transparent gap-2 justify-start px-3 py-2.5"
              >
                <Link href={item.to}>
                  {item.icon} {item.content}
                </Link>
              </Button>
            ))}
            {!isOwner && (
              <Button
                type="button"
                variant="ghost"
                className="btn-transparent gap-2 justify-start px-3 py-2.5 w-full"
                onClick={handleReportUser}
              >
                <MessageSquareWarning className="size-4" /> Báo cáo
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {!isOwner && isFollowing === false && (
          <Button
            type="button"
            variant="ghost"
            className="btn-primary px-8 text-nowrap h-10"
            onClick={onRequestFollow}
          >
            Theo dõi
          </Button>
        )}
        {!isOwner && isFollowing === true && (
          <Button
            type="button"
            variant="ghost"
            className="btn-secondary px-5 text-nowrap h-10"
            onClick={onUnfollow}
          >
            Đang theo dõi
          </Button>
        )}
      </div>
    </div>
  );
}
