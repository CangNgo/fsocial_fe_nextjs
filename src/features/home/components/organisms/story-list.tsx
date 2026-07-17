import StoryItem from "../molecules/story-item";

interface StoryListProps {
  createPost: () => void;
}

const StoryList = ({ createPost }: StoryListProps) => {
  return (
    <div className="flex gap-2 h-40 w-full bg-white rounded-2xl p-4">
      <StoryItem action={createPost} />
    </div>
  );
};

export default StoryList;
