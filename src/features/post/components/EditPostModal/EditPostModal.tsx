"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { LoadingIcon } from "@/components/atoms/Icon";
import { TextBox } from "@/components/atoms/JumpingInput";
import { getPost, updatePost } from "@/lib/api/posts/postsApi";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { usePopupStore } from "@/store/popupStore";
import { getInitialsFromDisplayName } from "@/utils/combineName";
import { dateTimeToPostTime } from "@/utils/convertDateTime";

interface EditPostModalProps {
  id: string;
  store?: unknown;
}

export function EditPostModal({ id, store }: EditPostModalProps) {
  const { hidePopup } = usePopupStore();
  const user = ownerAccountStore.getState().user;
  const textbox = useRef<HTMLDivElement>(null);
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [submitClicked, setSubmitClicked] = useState(false);

  useEffect(() => {
    const s = store as { getState?: () => { findPost?: (id: string) => unknown } } | undefined;
    const found = s?.getState?.()?.findPost?.(id);
    if (found) {
      setPost(found as Record<string, unknown>);
    } else {
      getPost(user?.userId ?? "", id).then((resp: unknown) => {
        const r = resp as { statusCode?: number; data?: unknown };
        if (r?.statusCode === 200) setPost(r.data as Record<string, unknown>);
      });
    }
  }, [user?.userId, store, id]);

  const handleUpdate = async () => {
    if (!textbox.current) return;
    setSubmitClicked(true);
    const formData = new FormData();
    formData.append("text", textbox.current.innerText);
    formData.append("HTMLText", textbox.current.innerHTML);
    formData.append("postId", id);
    const resp = (await updatePost(formData)) as { statusCode?: number; data?: unknown } | null;
    setSubmitClicked(false);
    if (!resp || resp.statusCode !== 200) {
      toast.error("Cập nhật bài viết thất bại");
      return;
    }
    toast.success("Đã cập nhật bài viết");
    hidePopup();
  };

  return (
    <div className="relative pt-10 flex flex-col sm:w-[550px] sm:h-fit sm:max-h-[90dvh] h-[100dvh]">
      {post && (
        <div className="flex-grow pt-3 space-y-2 overflow-y-auto">
          <div className="flex space-x-2 px-4">
            <Avatar className="size-9">
              <AvatarImage src={(post.avatar as string) ?? undefined} />
              <AvatarFallback className="text-[11px] font-medium">
                {getInitialsFromDisplayName(post.displayName as string)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col justify-center">
              <span className="font-semibold">{post.displayName as string}</span>
              <span className="text-muted-foreground text-xs">
                {dateTimeToPostTime(post.createDatetime as string)}
              </span>
            </div>
          </div>

          <TextBox
            texboxRef={textbox}
            placeholder="Hãy nghĩ gì đó..."
            className="min-h-[100px] px-4 py-2"
            innerHTML={(post.HTMLText as string) ?? (post.text as string) ?? ""}
            autoFocus
          />
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
