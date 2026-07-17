import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";
import type React from "react";
import { Image } from "../atoms/image";

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
      <Image alt="avatar" width={0} height={0} className="w-full h-full object-cover" sizes="100" src={src} />
      {!src && (
        <AvatarFallback className={cn("text-[11px] absolute font-medium transition", fallbackClassName)}>
          {fallback}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
