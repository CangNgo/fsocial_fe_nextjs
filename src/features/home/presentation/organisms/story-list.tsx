import { Button } from '@/shared/components/atoms/button';
import { User } from '@/shared/stores/owner-account-store';
import Image from 'next/image';

interface StoryListProps {
  createPost: () => void;
  user: User;
}

const StoryList = ({ createPost, user }: StoryListProps) => {
  return (
    <div className='flex gap-2 h-30 w-full ' >
      <StoryItem user={user} action={createPost} />
    </div>
  )
}

interface IStoryItemProps {
  user: User;
  action: () => void;
}

const StoryItem = ({ user, action }: IStoryItemProps) => {
  const displayName = user?.displayName ?? "";
  return (
    <div className="relative w-80 cursor-pointer bg-white w" onClick={action}>
      <div className="relative">
        <Image width={100}
          height={300} src={user?.avatar || ""} alt="user" />
      </div>
      <span className="flex-1 text-sm text-muted-foreground select-none">
        {displayName ? `${displayName}, bạn đang nghĩ gì?` : "Bạn đang nghĩ gì?"}
      </span>
    </div>
  )
}

export default StoryList