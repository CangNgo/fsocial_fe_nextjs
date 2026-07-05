"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { updatePost } from "@/shared/api/posts/posts-api";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { usePopupStore } from "@/shared/stores/popup-store";
import { dateTimeToPostTime } from "@/shared/utils/convert-date-time";
import type { PostCardStore } from "../../hooks/use-post-card-actions";
import { usePostForModal } from "../../hooks/use-post-for-modal";

interface EditPostModalProps {
  id: string;
  store?: PostCardStore;
}

export function EditPostModal({ id, store }: EditPostModalProps) {
  const { hidePopup } = usePopupStore();
  const textbox = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);
  const { post, updateStoredPost } = usePostForModal({ id, store });

  useEffect(() => {
    if (!post) return;
    const postContent = post.content as { text?: string; htmltext?: string } | undefined;
    queueMicrotask(() => {
      setContent(postContent?.text ?? postContent?.htmltext ?? (post.text as string) ?? "");
    });
  }, [post]);

  const handleUpdate = async () => {
    if (!content.trim()) return;

    setSubmitClicked(true);
    const formData = new FormData();
    formData.append("text", content);
    formData.append("HTMLText", content);
    formData.append("postId", id);
    const resp = (await updatePost(formData)) as { statusCode?: number; data?: unknown } | null;
    setSubmitClicked(false);
    if (resp?.statusCode !== 200) {
      toast.error("Cập nhật bài viết thất bại");
      return;
    }
    toast.success("Đã cập nhật bài viết");
    updateStoredPost({ content: { text: content, htmltext: content } });
    hidePopup();
  };

  return (
    <div className="relative pt-10 flex flex-col sm:w-[550px] sm:h-fit sm:max-h-[90dvh] h-[100dvh]">
      {post && (
        <div className="flex-grow pt-3 space-y-2 overflow-y-auto">
          <div className="flex space-x-2 px-4">
            <UserAvatar
              src={post.avatar as string}
              displayName={post.displayName as string}
              className="size-9"
            />
            <div className="flex flex-col justify-center">
              <span className="font-semibold">{post.displayName as string}</span>
              <span className="text-muted-foreground text-xs">
                {dateTimeToPostTime(post.createDatetime as string)}
              </span>
            </div>
          </div>

          <div className="px-4">
            <Textarea
              ref={textbox}
              placeholder="Hãy nghĩ gì đó..."
              className="min-h-[100px] py-2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      )}
      <div className="sticky bottom-0 p-3 bg-background border-t flex gap-3">
        <Button
          type="button"
          variant="ghost"
          className="btn-secondary py-2.5 flex-1"
          onClick={hidePopup}
        >
          Hủy bỏ
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`btn-primary py-2.5 flex-1 ${submitClicked ? "opacity-50" : ""}`}
          onClick={handleUpdate}
        >
          {submitClicked ? <LoadingIcon /> : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
