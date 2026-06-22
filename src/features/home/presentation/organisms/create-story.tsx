import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

export default function CreateStory() {
  const user = ownerAccountStore((state) => state.user);
  return (
    <div className="flex">
      <Avatar className="size-9 ">
        <AvatarImage src={user?.avatar ?? undefined} />
        <AvatarFallback className="text-[11px] font-medium">
          {getInitialsFromDisplayName(user?.displayName ?? "")}
        </AvatarFallback>
      </Avatar>
      <input type="text" />
    </div>)
}