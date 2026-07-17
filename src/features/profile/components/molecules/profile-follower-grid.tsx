import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";
import type { ProfileFollower } from "../../types/profile-tabs";

interface ProfileFollowerGridProps {
  followers?: ProfileFollower[];
}

export function ProfileFollowerGrid({ followers }: ProfileFollowerGridProps) {
  if (!followers || followers.length === 0) {
    return <p className="text-center col-span-5">Không có người theo dõi</p>;
  }

  return (
    <>
      {followers.map((friend) => (
        <div key={friend.userId ?? friend.firstName}>
          <div className="aspect-square">
            <Avatar className="size-full rounded-md">
              <AvatarImage
                src={friend.avatar}
                alt={`${friend.firstName} ${friend.lastName}`}
                className="rounded-none"
              />
              <AvatarFallback className="rounded-none text-[32px]">
                {combineIntoAvatarName(friend.firstName, friend.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>
          <p className="font-semibold">
            {combineIntoDisplayName(friend.firstName, friend.lastName)}
          </p>
        </div>
      ))}
    </>
  );
}
