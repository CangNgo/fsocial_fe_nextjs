import { PlusIcon } from "lucide-react";
import React from "react";
import { Image } from "@/shared/components/atoms/image";
import { Card } from "@/shared/components/ui/card";
import { ownerAccountStore, type User } from "@/shared/stores/owner-account-store";

interface IStoryItemProps {
  action: () => void;
}

const StoryItem = ({ action }: IStoryItemProps) => {
  const user: User = ownerAccountStore((state) => state.user);
  return (
    <Card
      className="relative cursor-pointer bg-white w-1/6 p-0 flex flex-col gap-0 overflow-hidden"
      onClick={action}
    >
      <div className="relative w-full flex-1 h-2/3">
        <Image
          className="object-cover"
          src={user?.avatar}
          alt="user"
          fill
          sizes="(max-width: 768px) 33vw, 16vw"
        />
        <div className="absolute bottom-[-16px] left-[calc(50%-16px)] p-1 bg-blue-500/90 rounded-full border-2 border-white">
          <PlusIcon className="w-5 h-5 text-white" />
        </div>
      </div>
      <span className="text-sm mt-2 text-muted-foreground select-none text-center py-2">
        Tạo tin
      </span>
    </Card>
  );
};
export default StoryItem;
