interface ProfileFollowerPreviewProps {
  followers?: string[];
  onViewAll: () => void;
}

// ponytail: avatar preview not implemented yet, add when design/data (friend objects, not string[]) is ready
export function ProfileFollowerPreview({}: ProfileFollowerPreviewProps) {
  return (
    <div className="mt-1 flex -space-x-2">
      {/* {preview.map((friend, index) => (
        <div key={friend.userId ?? friend.firstName} className="relative">
          <Avatar className="size-7 ring-[2px] ring-background transition">
            <AvatarImage src={friend.avatar} />
            <AvatarFallback className="text-[11px] font-medium">
              {combineIntoAvatarName(friend.firstName, friend.lastName)}
            </AvatarFallback>
          </Avatar>
          {index + 1 === Math.min(MAX_PREVIEW_FRIENDS_AVATAR, followers?.length ?? 0) && (
            <Button
              type="button"
              className="absolute top-0 size-full bg-black/50 grid place-content-center rounded-full hover:bg-black/60"
              onClick={onViewAll}
            >
              <Ellipsis className="size-4 text-txtWhite" />
            </Button>
          )}
        </div>
      ))} */}
    </div>
  );
}
