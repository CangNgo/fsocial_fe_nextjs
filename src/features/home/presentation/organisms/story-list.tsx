import type { User } from "@/shared/stores/owner-account-store";
import StoryItem from "../molecules/story-item";

interface StoryListProps {
  createPost: () => void;
}

const StoryList = ({ createPost }: StoryListProps) => {
  return (
    <div className="flex gap-2 h-40 w-full ">
      <StoryItem action={createPost} />
    </div>
  );
};

export default StoryList;
