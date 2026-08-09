import { PostList } from "@/features/post";
import type { PostCardPost, PostCardStore } from "@/features/post/hooks/use-post-card-actions";
import {
  FollowerProfileTabIcon,
  PictureProfileTabIcon,
  PostProfileTabIcon,
  ReactedProfileTabIcon,
  VideoProfileTabIcon,
} from "@/shared/components/atoms/icon/icon";
import { Button } from "@/shared/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import type { AttachmentMediaResponse } from "@/shared/types/attachments";
import type { ProfileFollower } from "../../types/profile-tabs";
import { ProfileFollowerGrid } from "../molecules/profile-follower-grid";
import { ProfilePictureGrid } from "../molecules/profile-picture-grid";

const listTabs = [
  { label: "Bài đăng", icon: <PostProfileTabIcon /> },
  { label: "Hình ảnh", icon: <PictureProfileTabIcon /> },
  { label: "Video", icon: <VideoProfileTabIcon /> },
  { label: "Người theo dõi", icon: <FollowerProfileTabIcon /> },
  { label: "Đã tương tác", icon: <ReactedProfileTabIcon /> },
];

interface ProfileTabsProps {
  isOwner: boolean;
  currentTab: number | null;
  onTabClick: (index: number) => void;
  setCarouselApi: (api: CarouselApi) => void;
  postsUser: PostCardPost[] | null;
  fetchPostsUser: () => void;
  hasMorePosts?: boolean;
  postListStore?: PostCardStore;
  pictures: AttachmentMediaResponse[];
  fetchPictures?: () => void;
  hasMorePictures?: boolean;
  videos: AttachmentMediaResponse[];
  fetchVideos?: () => void;
  hasMoreVideos?: boolean;
  followers?: ProfileFollower[];
}

export function ProfileTabs({
  isOwner,
  currentTab,
  onTabClick,
  setCarouselApi,
  postsUser,
  fetchPostsUser,
  hasMorePosts,
  pictures,
  fetchPictures,
  hasMorePictures,
  videos,
  fetchVideos,
  hasMoreVideos,
  followers,
}: ProfileTabsProps) {
  return (
    <div className="mt-8 flex flex-col gap-2">
      <div className="flex bg-background transition">
        {(isOwner ? listTabs : listTabs.slice(0, 4)).map((tab, index) => (
          <Button
            type="button"
            key={tab.label}
            variant={"outline"}
            className={`grow flex items-center justify-center gap-1 px-1 sm:py-1 py-3 
                cursor-pointer border-0 rounded-none
              ${currentTab === index
                ? "text-primary-text fill-primary-text stroke-primary-text border-primary-text border-bottom-faded"
                : "text-gray fill-gray stroke-gray border-background"
              }`}
            onClick={() => onTabClick(index)}
          >
            {tab.icon}
            <span className="sm:inline hidden">{tab.label}</span>
          </Button>
        ))}
      </div>

      <Carousel setApi={setCarouselApi} opts={{ watchDrag: true }}>
        <CarouselContent className="ml-0">
          {/* Tab 0: Posts */}
          <CarouselItem className="pl-0 pt-0.5 mx-auto md:pb-0 flex justify-center">
            <PostList
              posts={postsUser}
              fetchPosts={fetchPostsUser}
              hasMore={hasMorePosts}
              cardStyle
            />
          </CarouselItem>

          {/* Tab 1: Pictures */}
          <CarouselItem className="pl-0 grid grid-cols-3 gap-[1px]">
            <ProfilePictureGrid
              pictures={pictures}
              fetchPictures={fetchPictures}
              hasMorePictures={hasMorePictures}
            />
          </CarouselItem>

          {/* Tab 2: Videos */}
          <CarouselItem className="pl-0 grid grid-cols-3 gap-[1px]">
            <ProfilePictureGrid
              pictures={videos}
              fetchPictures={fetchVideos}
              hasMorePictures={hasMoreVideos}
            />
          </CarouselItem>

          {/* Tab 3: Followers */}
          <CarouselItem className="pl-0 grid grid-cols-5 sm:gap-3 gap-2">
            <ProfileFollowerGrid followers={followers} />
          </CarouselItem>

          {/* Tab 4: Posts reacted (owner only) */}
          {isOwner && (
            <CarouselItem className="pl-0 pt-0.5 mx-auto md:pb-0">
              <PostList posts={postsUser} hasMore={false} cardStyle />
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
