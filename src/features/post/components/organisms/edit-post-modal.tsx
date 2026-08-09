"use client";
import { PostEditor } from "@/features/editor/preset/post-editor";
import { updatePost } from "@/services/posts/posts-api";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { usePopupStore } from "@/shared/stores/popup-store";
import { dateTimeToPostTime } from "@/shared/utils/convert-date-time";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { PostCardStore } from "../../hooks/use-post-card-actions";
import { usePostForModal } from "../../hooks/use-post-for-modal";

interface EditPostModalProps {
  id: string;
  store?: PostCardStore;
}

export function EditPostModal({ id, store }: EditPostModalProps) {
  const { hidePopup } = usePopupStore();
  const [text, setText] = useState("");
  const [html, setHtml] = useState("");
  const [submitClicked, setSubmitClicked] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const { post, updateStoredPost } = usePostForModal({ id, store });

  useEffect(() => {
    if (!post) return;

    const postContent = post.content as { text?: string; html?: string } | undefined;
    queueMicrotask(() => {
      setText(postContent?.text || "");
      setHtml(postContent?.html || "");
      setContentLoaded(true);
    });
  }, [post]);

  const handleUpdate = async () => {
    if (!text.trim()) return;

    setSubmitClicked(true);
    const formData = new FormData();
    formData.append("text", text);
    formData.append("html", html);
    formData.append("postId", id);
    const resp = (await updatePost(formData));
    setSubmitClicked(false);
    if (resp?.statusCode !== 200) {
      toast.error("Cập nhật bài viết thất bại");
      return;
    }
    toast.success("Đã cập nhật bài viết");
    updateStoredPost({ content: { text, html } });
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
            {contentLoaded && (
              <PostEditor
                content={html}
                onSave={({ text, html }) => {
                  setText(text);
                  setHtml(html);
                }}
                placeholder="Hôm nay của bạn thế nào ...."
              />
            )}
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
