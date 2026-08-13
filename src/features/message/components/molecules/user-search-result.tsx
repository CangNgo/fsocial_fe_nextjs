"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import type { UserResult } from "@/shared/types/search";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

interface UserSearchResultProps {
  user: UserResult;
  onSelect: (user: UserResult) => void;
  disabled?: boolean;
}

export function UserSearchResult({ user, onSelect, disabled }: UserSearchResultProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      className="w-full text-left px-3 py-2.5 h-auto rounded-md flex justify-start items-center gap-3 hover:bg-gray-2light transition cursor-pointer"
      onClick={() => onSelect(user)}
    >
      <Avatar className="size-11">
        <AvatarImage src={user.avatar ?? undefined} />
        <AvatarFallback className="fs-xs">
          {getInitialsFromDisplayName(user.displayName ?? "")}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{user.displayName}</span>
    </Button>
  );
}
