import { Image } from "@/shared/components/atoms/image";
import { Card } from "@/shared/components/ui/card";
import { ownerAccountStore, type User } from "@/shared/stores/owner-account-store";
import { PlusIcon } from "lucide-react";

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
      <div className="relative w-full flex-1">
        <Image
          className="object-cover"
          src={user?.avatar}
          alt="user"
          fill
          sizes="(max-width: 768px) 33vw, 16vw"
        />
        <div className="absolute top-1/3 left-[calc(50%-16px)] p-1 bg-primary rounded-full border-2 border-white">
          <PlusIcon className="w-6 h-6 text-white" />
        </div>
      </div>
      <span className="text-sm absolute bottom-1 left-[50%] -translate-x-1/2 text-muted-foreground select-none text-center 
      bg-transparent text-white font-bold  ">
        Tạo tin
      </span>
    </Card>
  );
};
export default StoryItem;
