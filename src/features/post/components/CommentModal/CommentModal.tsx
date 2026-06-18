"use client";
import { Send } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { HeartPostIcon, LoadingIcon, XMarkIcon } from "@/components/atoms/Icon";
import { TextBox } from "@/components/atoms/JumpingInput";
import {
  getComments,
  getRepliesComment,
  likeComment,
  replyComment,
  sendComment,
} from "@/lib/api/posts/commentsApi";
import { getPost } from "@/lib/api/posts/postsApi";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { usePopupStore } from "@/store/popupStore";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/utils/combineName";
import { dateTimeToNotiTime } from "@/utils/convertDateTime";
import { getTextboxData } from "@/utils/processTextboxData";

const PostCard = dynamic(
  () => import("@/components/organisms/PostCard").then((m) => ({ default: m.PostCard })),
  { ssr: false },
);

interface Comment {
  id: string;
  commentId?: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  content: { htmltext?: string; text?: string };
  createDatetime: string;
  countLikes: number;
  like?: boolean;
  reply?: boolean | Comment[];
}

interface CommentReply {
  id: string;
  reply: Comment[];
}

function RenderComment({
  comment,
  selectCommentToReply,
  handleShowReplyComment,
  replies,
}: {
  comment: Comment;
  selectCommentToReply: (c: Comment) => void;
  handleShowReplyComment: (id: string) => void;
  replies?: CommentReply;
}) {
  const router = useRouter();
  const user = ownerAccountStore((state) => state.user);
  const { hidePopup } = usePopupStore();
  const [like, setLike] = useState(comment.like ?? false);
  const [countLikes, setCountLikes] = useState(comment.countLikes ?? 0);

  const handleClickLike = async () => {
    setLike(!like);
    setCountLikes(like ? countLikes - 1 : countLikes + 1);
    await likeComment({ commentId: comment.id, userId: user?.userId });
  };

  console.log("comment: ", comment);

  const handleDirectToProfile = () => {
    hidePopup();
    router.push(`/profile?id=${comment.userId}`);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-9 cursor-pointer" onClick={handleDirectToProfile}>
        <AvatarImage src={comment.avatar ?? undefined} />
        <AvatarFallback className="text-[11px]">
          {combineIntoAvatarName(comment.firstName, comment.lastName)}
        </AvatarFallback>
      </Avatar>
      <div>
        <div className="space-y-1">
          <Link
            href={`/profile?id=${comment.userId}`}
            onClick={hidePopup}
            className="block font-semibold text-muted-foreground text-xs hover:underline hover:text-foreground"
          >
            {combineIntoDisplayName(comment.firstName, comment.lastName)}
          </Link>
          {/* biome-ignore lint/security/noDangerouslySetInnerHtml: renders pre-sanitized formatted comment content */}
          <div dangerouslySetInnerHTML={{ __html: comment.content?.htmltext ?? "" }} />
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

interface CommentModalProps {
  id: string;
  store?: unknown;
}

export function CommentModal({ id, store }: CommentModalProps) {
  const user = ownerAccountStore((state) => state.user);
  const textbox = useRef<HTMLDivElement>(null);
  const s = store as
    | {
        getState?: () => {
          updatePost?: (id: string, props: unknown) => void;
          findPost?: (id: string) => Comment | null;
        };
      }
    | undefined;

  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [submitCmtClicked, setSubmitCmtClicked] = useState(false);
  const [selectReply, setSelectReply] = useState<Partial<Comment>>({});
  const [commentsReply, setCommentsReply] = useState<CommentReply[]>([]);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const found = s?.getState?.()?.findPost?.(id);
    if (found) {
      setPost(found as unknown as Record<string, unknown>);
    } else {
      getPost(user?.userId ?? "", id).then((resp: unknown) => {
        const r = resp as { statusCode?: number; data?: unknown };
        if (r?.statusCode === 200) setPost(r.data as Record<string, unknown>);
      });
    }
    getComments(id).then((resp: unknown) => {
      const r = resp as { statusCode?: number; data?: Comment[] };
      if (r?.statusCode === 207 || r?.statusCode === 200) setComments((r.data ?? []).reverse());
    });
  }, [user?.userId, id, s]);

  const selectCommentToReply = (selectedComment: Comment) => {
    const { userId, firstName, lastName } = selectedComment;
    const exist = Array.from(textbox.current?.childNodes ?? []).find(
      (el: unknown) => (el as HTMLElement)?.dataset?.mention === userId,
    );
    if (exist) return;
    setSelectReply(selectedComment);
    if (textbox.current) {
      textbox.current.innerHTML += `<a href="" class="text-primary font-semibold" contenteditable="false" data-mention="${userId}">${combineIntoDisplayName(firstName, lastName)}</a>&nbsp;`;
    }
    setTrigger(!trigger);
  };

  const handleSendComment = async () => {
    const { innerText, innerHTML } = getTextboxData(textbox as React.RefObject<HTMLElement>);
    if (!innerText || !innerHTML) {
      if (textbox.current) textbox.current.innerHTML = "";
      setTrigger(!trigger);
      return;
    }
    setSubmitCmtClicked(true);
    const formData = new FormData();
    formData.append("userId", user?.userId ?? "");
    formData.append("text", innerText);
    formData.append("HTMLText", innerHTML);

    let resp: unknown;
    if (selectReply.id) {
      formData.append("commentId", selectReply.commentId ?? selectReply.id ?? "");
      resp = await replyComment(formData);
    } else {
      formData.append("postId", id);
      resp = await sendComment(formData);
    }
    const r = resp as { statusCode?: number; data?: Comment };
    if (!resp || r.statusCode !== 200) {
      toast.error("Bình luận thất bại");
      setSubmitCmtClicked(false);
      return;
    }
    toast.success("Đã đăng bình luận");
    if (textbox.current) textbox.current.innerHTML = "";

    const now = new Date();
    now.setHours(now.getHours() + 7);
    const newCmt: Comment = {
      ...(r.data ?? {}),
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      avatar: user?.avatar,
      countLikes: 0,
      like: false,
      createDatetime: now.toISOString(),
    } as Comment;

    if (selectReply.id) {
      const exist = commentsReply.find((cr) => cr.id === selectReply.id);
      if (exist) {
        setCommentsReply(
          commentsReply.map((cr) =>
            cr.id === selectReply.id ? { ...cr, reply: [...cr.reply, newCmt] } : cr,
          ),
        );
      } else if (selectReply.commentId) {
        const exist2 = commentsReply.find((cr) => cr.id === selectReply.commentId);
        if (exist2)
          setCommentsReply(
            commentsReply.map((cr) =>
              cr.id === selectReply.commentId ? { ...cr, reply: [...cr.reply, newCmt] } : cr,
            ),
          );
      } else {
        setCommentsReply([...commentsReply, { id: selectReply.id, reply: [newCmt] }]);
      }
      setComments(comments.map((c) => (c.id === selectReply.id ? { ...c, reply: true } : c)));
    } else {
      setComments([newCmt, ...comments]);
    }
    setSelectReply({});
    s?.getState?.()?.updatePost?.(id, {
      countComments: ((post?.countComments as number) ?? 0) + 1,
    });
    setTrigger(!trigger);
    setSubmitCmtClicked(false);
  };

  const handleShowReplyComment = async (commentId: string) => {
    const resp = (await getRepliesComment(commentId)) as {
      statusCode?: number;
      data?: Comment[];
    } | null;
    if (!resp || resp.statusCode !== 200) {
      toast.error("Lấy phản hồi bình luận thất bại");
      return;
    }
    setCommentsReply([...commentsReply, { id: commentId, reply: resp.data ?? [] }]);
  };

  return (
    <div className="relative pt-10 flex flex-col sm:w-[540px] w-screen sm:h-[95dvh] h-[100dvh]">
      <div className="overflow-y-auto flex-grow flex flex-col">
        {post && (
          <PostCard post={post} isChildren className="border-b" store={store} allowCarousel />
        )}
        <div className="space-y-3 pt-3 pb-14 px-5 flex-grow">
          {comments.map((comment) => (
            <RenderComment
              key={comment.id}
              comment={comment}
              selectCommentToReply={selectCommentToReply}
              handleShowReplyComment={handleShowReplyComment}
              replies={commentsReply.find((item) => item.id === comment.id)}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Hãy là người đầu tiên bình luận bài viết này
            </p>
          )}
        </div>
      </div>

      <div className="sticky bottom-0">
        <div
          className={`absolute w-full -z-10 bg-background top-0 border-t py-2 px-4 flex items-center justify-between ${selectReply.id ? "-translate-y-full" : "translate-y-0"} transition`}
        >
          <p className="text-sm">
            Đang phản hồi{" "}
            <span className="font-semibold">
              {combineIntoDisplayName(selectReply.firstName ?? "", selectReply.lastName ?? "")}
            </span>
          </p>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setSelectReply({})}
            className="cursor-pointer"
          >
            <XMarkIcon className="" />
          </Button>
        </div>
        <div className="bg-background flex items-end gap-4 px-4 pt-2 pb-3 border-t">
          <Avatar className="size-9">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-[11px]">
              {combineIntoAvatarName(user?.firstName ?? "", user?.lastName ?? "")}
            </AvatarFallback>
          </Avatar>
          <TextBox
            texboxRef={textbox}
            className="py-2 w-full max-h-[40vh]"
            placeholder="Viết bình luận"
            contentEditable={!submitCmtClicked}
            onKeyDown={(e) => {
              if (window.innerWidth <= 640) return;
              if (e.key === "Enter" && !e.shiftKey) handleSendComment();
            }}
            autoFocus
            trigger={trigger}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="py-2 px-1"
            onClick={handleSendComment}
          >
            {submitCmtClicked ? <LoadingIcon /> : <Send className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
