import { Comment, CommentReply } from "@/shared/types/comment";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useState } from "react";
import { useLikeComment } from "../../hooks/mutations/use-comment-mutations";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { ROUTES } from "@/shared/config/routes";
import Link from "next/link";
import { dateTimeToNotiTime } from "@/shared/utils/convert-date-time";
import { Button } from "@/shared/components/ui/button";
import { HeartPostIcon } from "@/shared/components/atoms/icon/icon";
import { useRouter } from "next/navigation";

interface RenderCommentProps {
  comment: Comment;
  selectCommentToReply: (c: Comment) => void;
  handleShowReplyComment: (id: string) => void;
  replies?: CommentReply;
}

export function RenderComment({
  comment,
  selectCommentToReply,
  handleShowReplyComment,
  replies,
}: RenderCommentProps) {
  const router = useRouter();
  const user = ownerAccountStore((state) => state.user);
  const { hidePopup } = usePopupStore();
  const [like, setLike] = useState(comment.like ?? false);
  const [countLikes, setCountLikes] = useState(comment.countLikes ?? 0);
  const { mutate: likeComment } = useLikeComment();

  const handleClickLike = () => {
    setLike(!like);
    setCountLikes(like ? countLikes - 1 : countLikes + 1);
    likeComment({ commentId: comment.id, userId: user.id });
  };

  const handleDirectToProfile = () => {
    hidePopup();
    router.push(ROUTES.PROFILE(comment.userId));
  };

  return (
    <div className="flex gap-3">
      <UserAvatar
        src={comment.avatar}
        initials={comment.displayName ?? ""}
        className="size-9 cursor-pointer"
        onClick={handleDirectToProfile}
      />
      <div>
        <div className="space-y-1">
          <Link
            href={`/profile?id=${comment.userId}`}
            onClick={hidePopup}
            className="block font-semibold text-muted-foreground text-xs hover:underline hover:text-foreground"
          >
            {comment.displayName ?? ""}
          </Link>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: renders pre-sanitized formatted comment content */}
          <div dangerouslySetInnerHTML={{ __html: comment.content?.text ?? "" }} />
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs">{dateTimeToNotiTime(comment.createDatetime).textTime}</span>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="flex items-center gap-1"
              onClick={handleClickLike}
            >
              <HeartPostIcon compareVar={like} className="sm:h-[15px] h-[13px]" fill="fill-gray" />
              <span className={`text-xs ${like ? "text-primary" : ""}`}>{countLikes}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              className="text-xs hover:text-foreground"
              onClick={() => selectCommentToReply(comment)}
            >
              Phản hồi
            </Button>
          </div>
        </div>
        {comment.reply && (
          <div className="mt-3 space-y-2">
            {!replies ? (
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="text-xs ps-2 font-semibold text-muted-foreground hover:underline"
                onClick={() => handleShowReplyComment(comment.id)}
              >
                Xem phản hồi
              </Button>
            ) : (
              replies.reply.map((cmtReply) => (
                <RenderComment
                  key={cmtReply.id}
                  comment={cmtReply}
                  selectCommentToReply={selectCommentToReply}
                  handleShowReplyComment={handleShowReplyComment}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
