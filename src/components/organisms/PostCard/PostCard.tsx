"use client";

import { Ellipsis, MessageSquareWarning, Pen } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  CommentPostIcon,
  HeartPostIcon,
  RepostPostIcon,
  SharePostIcon,
  TrashCanIcon,
} from "@/components/atoms/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";
import { MediaGrid } from "@/components/molecules/MediaGrid";
import { likePost } from "@/lib/api/posts/postsApi";
import { cn } from "@/lib/utils";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { usePopupStore } from "@/store/popupStore";
import { getInitialsFromDisplayName } from "@/utils/combineName";
import { timeAgo } from "@/utils/convertDateTime";
import { processMedias } from "@/utils/processMedia";

// Dynamically import heavy modals to keep the initial bundle light
const CommentModal = dynamic(
  () => import("@/features/post/components/CommentModal").then((m) => m.CommentModal),
  { ssr: false },
);
const ReportModal = dynamic(
  () => import("@/features/post/components/ReportModal").then((m) => m.ReportModal),
  { ssr: false },
);
const EditPostModal = dynamic(
  () => import("@/features/post/components/EditPostModal").then((m) => m.EditPostModal),
  { ssr: false },
);
const DeletePostModal = dynamic(
  () => import("@/features/post/components/DeletePostModal").then((m) => m.DeletePostModal),
  { ssr: false },
);
const ModalRepost = dynamic(
  () => import("@/features/post/components/ModalRepost").then((m) => m.ModalRepost),
  { ssr: false },
);

export interface PostCardProps {
  post: any;
  setPost?: React.Dispatch<React.SetStateAction<any>>;
  isChildren?: boolean;
  showReact?: boolean;
  className?: string;
  /** Optional Zustand store with updatePost action. If omitted no store updates happen. */
  store?: any;
  isShared?: boolean;
  allowCarousel?: boolean;
  blockEvent?: boolean;
}

export function PostCard({
  post,
  setPost,
  isChildren = false,
  showReact = true,
  className = "",
  store,
  isShared = false,
  allowCarousel = false,
  blockEvent,
}: PostCardProps) {
  const { showPopup } = usePopupStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const user = ownerAccountStore.getState().user;

  const updatePost = store ? store((state: any) => state.updatePost) : () => {};

  const likes: number = post.countLikes;
  const liked: boolean = post.like;

  const showCommentPopup = () => {
    showPopup(
      `Bài viết của ${post.displayName ?? ""}`,
      <CommentModal id={post.id} store={store} />,
    );
  };

  const showRepostPopup = () => {
    showPopup("Đăng lại bài viết", <ModalRepost id={post.originPostId || post.id} store={store} />);
  };

  const handlePopupReport = () => {
    setPopoverOpen(false);
    showPopup("Báo cáo vi phạm", <ReportModal id={post.id} />);
  };

  const handlePopupEdit = () => {
    setPopoverOpen(false);
    showPopup("Chỉnh sửa bài viết", <EditPostModal id={post.id} store={store} />);
  };

  const handlePopupDelete = () => {
    setPopoverOpen(false);
    showPopup("Xóa bài viết", <DeletePostModal id={post.id} store={store} />);
  };

  const handleLike = async () => {
    if (setPost) {
      setPost((prev: any) => ({
        ...prev,
        like: !liked,
        countLikes: liked ? likes - 1 : likes + 1,
      }));
    }
    updatePost(post.id, {
      like: !liked,
      countLikes: liked ? likes - 1 : likes + 1,
    });
    likePost(post.id);
  };

  return (
    <article className={cn(className, "transition")}>
      {/* Header: avatar + name + options */}
      <div className={cn("flex items-center justify-between px-4 pt-4 pb-1", isShared && "px-6")}>
        <div className="flex space-x-2">
          <Link href={`/profile?id=${post.userId}`}>
            <Avatar className={cn("size-9", isShared && "size-8")}>
              <AvatarImage src={post.avatar} />
              <AvatarFallback className="text-[11px] font-medium transition">
                {getInitialsFromDisplayName(post.displayName ?? "")}
              </AvatarFallback>
            </Avatar>
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
            {post.userId !== user?.userId && (
              <Button
                type="button"
                className="btn-transparent justify-start py-2 ps-3 text-nowrap gap-3 w-full flex items-center"
                onClick={handlePopupReport}
              >
                <MessageSquareWarning className="size-5" /> Báo cáo
              </Button>
            )}
            {post.userId === user?.userId && (
              <Button
                type="button"
                className="btn-transparent justify-start text-nowrap py-2 ps-3 gap-3 w-full flex items-center"
                onClick={handlePopupEdit}
              >
                <Pen className="size-5" strokeWidth={1.6} /> Chỉnh sửa
              </Button>
            )}
            {post.userId === user?.userId && (
              <Button
                type="button"
                className="btn-transparent justify-start py-2 ps-3 text-nowrap gap-3 w-full flex items-center"
                onClick={handlePopupDelete}
              >
                <TrashCanIcon className="size-5" /> Xóa bài
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Body: content text + media */}
      <div>
        {post.content?.htmltext && post.content.htmltext !== "null" && (
          <div
            className={cn("px-5 mb-1.5", isShared && "px-7")}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: renders pre-sanitized formatted post content
            dangerouslySetInnerHTML={{ __html: post.content.htmltext }}
          />
        )}

        <MediaGrid
          medias={processMedias(post)}
          allowCarousel={allowCarousel}
          mediaCallback={() => {
            if (!post.originPostId) showCommentPopup();
          }}
          store={store}
          blockEvent={blockEvent}
          isShared={isShared}
          PostCardComponent={PostCard}
        />
      </div>

      {/* Reactions */}
      {showReact && (
        <div className="px-4 sm:py-4 py-3 flex justify-between">
          {/* Like */}
          {/* biome-ignore lint/a11y/useSemanticElements: kept as a div to preserve the reaction-bar layout; exposed as a button via role for assistive tech */}
          <div
            className="flex items-center sm:gap-2 gap-1 cursor-pointer"
            onClick={handleLike}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleLike();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <HeartPostIcon compareVar={liked} />
            <p className={liked ? "text-primary" : ""}>
              {likes > 0 ? likes : <span className="fs-sm sm:inline hidden">Tim</span>}
            </p>
          </div>

          {/* Comment */}
          <Link
            href=""
            className="flex items-center sm:gap-2 gap-1 cursor-pointer"
            onClick={showCommentPopup}
          >
            <CommentPostIcon />
            <p>
              {post.countComments > 0 ? (
                post.countComments
              ) : (
                <span className="fs-sm sm:inline hidden">Bình luận</span>
              )}
            </p>
          </Link>

          {/* Repost */}
          <Link
            href=""
            className="flex items-center sm:gap-2 gap-1  cursor-pointer"
            onClick={showRepostPopup}
          >
            <RepostPostIcon />
            <p>
              {post.repost > 0 ? (
                post.repost
              ) : (
                <span className="fs-sm sm:inline hidden">Đăng lại</span>
              )}
            </p>
          </Link>

          {/* Share */}
          <div className="flex items-center gap-2 cursor-pointer">
            <SharePostIcon />
            <span className="fs-sm sm:inline hidden">Chia sẻ</span>
          </div>
        </div>
      )}
    </article>
  );
}
