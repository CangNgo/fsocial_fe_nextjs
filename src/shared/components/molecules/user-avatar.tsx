import type React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

interface UserAvatarProps {
  src?: string | null;
  displayName?: string | null;
  /** initials to show in fallback — computed from displayName if omitted */
  initials?: string;
  className?: string;
  fallbackClassName?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
}

export function UserAvatar({
  src,
  displayName,
  initials,
  className,
  fallbackClassName,
  onClick,
}: UserAvatarProps) {
  const fallback = initials ?? getInitialsFromDisplayName(displayName ?? "");

  return (
    <Avatar className={className} onClick={onClick}>
      <AvatarImage src={src ?? undefined} />
      <AvatarFallback className={cn("text-[11px] font-medium transition", fallbackClassName)}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
