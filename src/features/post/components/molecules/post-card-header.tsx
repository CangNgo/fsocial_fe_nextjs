import { TrashCanIcon } from "@/shared/components/atoms/icon/icon"
import { UserAvatar } from "@/shared/components/molecules/user-avatar"
import { Button } from "@/shared/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover"
import { cn } from "@/shared/lib/utils"
import { PostResponse } from "@/shared/types/post"
import { timeAgo } from "@/shared/utils/convert-date-time"
import { Ellipsis, MessageSquareWarning, Pen } from "lucide-react"
import Link from "next/link"
import { Dispatch, SetStateAction } from "react"
import { PostCardPost, PostCardStore, usePostCardActions } from "../../hooks/use-post-card-actions"

interface PostCardHeaderProps {
  post: PostResponse;
  setPost?: Dispatch<SetStateAction<PostCardPost>>;
  store?: PostCardStore;
  showMore?: boolean;
}

export const PostCardHeader = ({ post, setPost, store, showMore = true }: PostCardHeaderProps) => {
  const {
    user,
    popoverOpen,
    setPopoverOpen,
    handlePopupReport,
    handlePopupEdit,
    handlePopupDelete,
  } = usePostCardActions({ post, setPost, store });

  return (
    <div className={cn("flex items-center justify-between px-4 pt-4 pb-1")}>
      <div className="flex space-x-2">
        <Link href={`/profile?id=${post.userId}`}>
          <UserAvatar
            src={post.avatar}
            displayName={post.displayName}
            className={cn("size-9")}
          />
        </Link>
        <div className="flex flex-col justify-center">
          <Link href={`/profile?id=${post.userId}`} className="font-semibold">
            {post.displayName ?? ""}
          </Link>
          <span className="text-gray fs-xs">{timeAgo(post.createDatetime)}</span>
        </div>
      </div>

      {showMore && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger className={cn("btn-transparent w-fit px-2 py-2 rounded-lg")}>
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
                variant={"outline"}
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
      )}
    </div>
  )
}