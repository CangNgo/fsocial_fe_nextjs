"use client";
import { LoadingIcon, XMarkIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { combineIntoDisplayName } from "@/shared/utils/combine-name";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useRepliesComment,
  useReplyComment,
  useSendComment,
} from "../../hooks/mutations/use-comment-mutations";
import { useComments } from "../../hooks/queries/use-comments";
import type { PostCardPost, PostCardStore } from "../../hooks/use-post-card-actions";
import { usePostForModal } from "../../hooks/use-post-for-modal";
import type { Comment, CommentReply } from "@/shared/types/comment";
import PostCard from "../molecules/post-card";
import { RenderComment } from "./render-comment";

interface CommentModalProps {
  id: string;
  store?: PostCardStore;
  initialMediaIndex?: number;
}

export function CommentModal({ id, store, initialMediaIndex }: CommentModalProps) {
  const user = ownerAccountStore((state) => state.user);
  const textbox = useRef<HTMLTextAreaElement>(null);
  const [commentText, setCommentText] = useState("");
  const [replyPrefix, setReplyPrefix] = useState("");
  const { post, updateStoredPost } = usePostForModal({ id, store });
  const [comments, setComments] = useState<Comment[]>([]);
  const [submitCmtClicked, setSubmitCmtClicked] = useState(false);
  const [selectReply, setSelectReply] = useState<Partial<Comment>>({});
  const [commentsReply, setCommentsReply] = useState<CommentReply[]>([]);
  const { data: commentsResp } = useComments(id);
  const { mutateAsync: sendComment } = useSendComment(id);
  const { mutateAsync: replyComment } = useReplyComment(id);
  const { mutateAsync: getRepliesComment } = useRepliesComment();

  useEffect(() => {
    if (commentsResp?.statusCode === 200) {
      queueMicrotask(() => {
        setComments(commentsResp.data ?? []);
      });
    }
    console.log("commentsResp", commentsResp);
  }, [commentsResp]);

  useEffect(() => {
    if (!textbox.current) return;

    textbox.current.focus();
    const nextPosition = textbox.current.value.length;
    textbox.current.setSelectionRange(nextPosition, nextPosition);
  }, []);

  const selectCommentToReply = (selectedComment: Comment) => {
    const mentionText = `${combineIntoDisplayName(
      selectedComment.firstName,
      selectedComment.lastName,
    )} `;

    setSelectReply(selectedComment);
    setReplyPrefix(mentionText);
    setCommentText((currentText) => {
      const textWithoutPrefix =
        replyPrefix && currentText.startsWith(replyPrefix)
          ? currentText.slice(replyPrefix.length)
          : currentText;

      return `${mentionText}${textWithoutPrefix}`;
    });
  };

  const handleSendComment = async () => {
    const innerText = commentText.trim();
    const innerHTML = innerText;

    if (!innerText) {
      setCommentText("");
      return;
    }

    setSubmitCmtClicked(true);
    const formData = new FormData();
    formData.append("userId", user.id ?? "");
    formData.append("text", innerText);
    formData.append("HTMLText", innerHTML);

    let resp: Awaited<ReturnType<typeof sendComment>>;
    if (selectReply.id) {
      formData.append("commentId", selectReply.commentId ?? selectReply.id ?? "");
      resp = await replyComment(formData);
    } else {
      formData.append("postId", id);
      resp = await sendComment(formData);
    }

    if (resp?.statusCode !== 200) {
      toast.error("Bình luận thất bại");
      setSubmitCmtClicked(false);
      return;
    }

    toast.success("Đã đăng bình luận");

    const now = new Date();
    now.setHours(now.getHours() + 7);
    const newCmt: Comment = {
      ...(resp.data ?? {}),
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

    setCommentText("");
    setReplyPrefix("");
    setSelectReply({});
    updateStoredPost({
      countComments: ((post?.countComments as number) ?? 0) + 1,
    });
    setSubmitCmtClicked(false);
  };

  const handleShowReplyComment = async (commentId: string) => {
    const resp = await getRepliesComment(commentId);
    if (resp?.statusCode !== 200) {
      toast.error("Lấy phản hồi bình luận thất bại");
      return;
    }
    const reply = (resp.data ?? []).map((c) => ({ ...c, commentId }));
    setCommentsReply([...commentsReply, { id: commentId, reply }]);
  };

  const handleCancelReply = () => {
    const updatedText = commentText.startsWith(replyPrefix)
      ? commentText.slice(replyPrefix.length)
      : commentText;

    setCommentText(updatedText);
    setReplyPrefix("");
    setSelectReply({});
  };

  return (
    <div className="relative pt-10 flex flex-col sm:w-[540px] w-screen sm:h-[95dvh] h-[100dvh]">
      <div className="overflow-y-auto flex-grow flex flex-col">
        {post && (
          <PostCard
            post={post as unknown as PostCardPost}
            isChildren
            className="border-b"
            store={store}
            allowCarousel
            initialMediaIndex={initialMediaIndex}
          />
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
            onClick={handleCancelReply}
            className="cursor-pointer"
          >
            <XMarkIcon className="" />
          </Button>
        </div>
        <div className="bg-background flex items-end gap-4 px-4 pt-2 pb-3 border-t">
          <UserAvatar src={user?.avatar} displayName={user?.displayName} className="size-9" />
          <Textarea
            ref={textbox}
            className="w-full max-h-[40vh] resize-none py-2"
            placeholder="Viết bình luận"
            disabled={submitCmtClicked}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (window.innerWidth <= 640) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
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
