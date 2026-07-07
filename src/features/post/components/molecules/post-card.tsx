"use client";

import { Ellipsis, MessageSquareWarning, Pen } from "lucide-react";
import Link from "next/link";
import type { Dispatch, SetStateAction } from "react";
import { memo } from "react";
import {
  CommentPostIcon,
  HeartPostIcon,
  RepostPostIcon,
  SharePostIcon,
  TrashCanIcon,
} from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { timeAgo } from "@/shared/utils/convert-date-time";
import {
  type PostCardPost,
  type PostCardStore,
  usePostCardActions,
} from "../../hooks/use-post-card-actions";
import { PhotoGrid } from "../organisms/photo-cell";
import { PostMediaCarousel } from "../organisms/post-media-carousel";

export interface PostCardProps {
  post: PostCardPost;
  setPost?: Dispatch<SetStateAction<PostCardPost>>;
  isChildren?: boolean;
  showReact?: boolean;
  className?: string;
  /** Optional Zustand store with updatePost action. If omitted no store updates happen. */
  store?: PostCardStore;
  isShared?: boolean;
  allowCarousel?: boolean;
  initialMediaIndex?: number;
}

function PostCardComponent({
  post,
  setPost,
  isChildren = false,
  showReact = true,
  className = "",
  store,
  isShared = false,
  allowCarousel = false,
  initialMediaIndex,
}: PostCardProps) {
  const {
    user,
    liked,
    popoverOpen,
    setPopoverOpen,
    showCommentPopup,
    showRepostPopup,
    handlePopupReport,
    handlePopupEdit,
    handlePopupDelete,
    handleLike,
  } = usePostCardActions({ post, setPost, store });

  return (
    <article className={cn(className, "transition")}>
      <div className={cn("flex items-center justify-between px-4 pt-4 pb-1", isShared && "px-6")}>
        <div className="flex space-x-2">
          <Link href={`/profile?id=${post.userId}`}>
            <UserAvatar
              src={post.avatar}
              displayName={post.displayName}
              className={cn("size-9", isShared && "size-8")}
            />
          </Link>
          <div className="flex flex-col justify-center">
            <Link href={`/profile?id=${post.userId}`} className="font-semibold">
              {post.displayName ?? ""}
            </Link>
            <span className="text-gray fs-xs">{timeAgo(post.createDatetime)}</span>
          </div>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger className={cn("btn-transparent w-fit px-2 py-2", isChildren && "hidden")}>
            <Ellipsis className="size-5" />
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="start"
            sideOffset={20}
            className="z-10 bg-background w-52 shadow-2xl p-2"
          >
            {post.userId !== user?.id && (
              <Button
                type="button"
                className="btn-transparent justify-start py-2 ps-3 text-nowrap gap-3 w-full flex items-center"
                onClick={handlePopupReport}
              >
                <MessageSquareWarning className="size-5" /> Báo cáo
              </Button>
            )}
            {post.userId === user?.id && (
              <Button
                type="button"
                variant={"outline"}
                className="btn-transparent justify-start text-nowrap py-2 ps-3 gap-3 w-full flex items-center"
                onClick={handlePopupEdit}
              >
                <Pen className="size-5" strokeWidth={1.6} /> Chỉnh sửa
              </Button>
            )}
            {post.userId === user?.id && (
              <Button
                type="button"
                variant={"outline"}
                className="btn-transparent justify-start py-2 ps-3 text-nowrap gap-3 w-full flex items-center"
                onClick={handlePopupDelete}
              >
                <TrashCanIcon className="size-5" /> Xóa bài
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div>
        {post.content?.htmltext && post.content.htmltext !== "null" ? (
          <div
            className={cn("px-5 mb-1.5", isShared && "px-7")}
            dangerouslySetInnerHTML={{ __html: post.content.htmltext }}
          />
        ) : (
          post.content?.text &&
          post.content.text !== "null" && (
            <div className={cn("px-5 mb-1.5 whitespace-pre-wrap", isShared && "px-7")}>
              {post.content.text}
            </div>
          )
        )}
        {allowCarousel ? (
          <PostMediaCarousel
            media={post.content?.media ?? []}
            initialIndex={initialMediaIndex ?? 0}
          />
        ) : (
          <PhotoGrid
            media={post.content?.media ?? []}
            onImageClick={(_, index) => {
              if (!post.originPostId) showCommentPopup(index);
            }}
          />
        )}
      </div>

      {showReact && (
        <div className="px-4 sm:py-2 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent"
              onClick={handleLike}
            >
              <HeartPostIcon compareVar={liked} />
              <span className="sm:block hidden">{post.countLikes}</span>
            </Button>

            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent"
              onClick={() => showCommentPopup()}
            >
              <CommentPostIcon />
              <span className="sm:block hidden">{post.countComments}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent"
              onClick={showRepostPopup}
            >
              <RepostPostIcon />
            </Button>

            <div className="flex items-center gap-2 cursor-pointer">
              <SharePostIcon />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

const PostCard = memo(PostCardComponent);

PostCard.displayName = "PostCard";

export default PostCard;
