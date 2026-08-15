import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { ROUTES } from "@/shared/config/routes";
import { UserResult } from "@/shared/types/search";
import { Link } from "lucide-react";

export function UserResultItem({ user }: { user: UserResult }) {
  const followerCount = user.follower?.length ?? 0;

  return (
    <Link
      href={ROUTES.PROFILE(user.id)}
      className="flex items-center gap-3 border-b py-3 transition hover:bg-muted/30"
    >
      <UserAvatar src={user.avatar} displayName={user.displayName} className="size-12" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold truncate">{user.displayName ?? user.username}</p>
        {user.username && <p className="text-sm text-gray truncate">@{user.username}</p>}
        {followerCount > 0 && <p className="fs-xs text-gray">{followerCount} người theo dõi</p>}
      </div>
    </Link>
  );
}