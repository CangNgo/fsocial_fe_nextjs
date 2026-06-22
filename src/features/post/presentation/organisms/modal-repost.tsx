"use client";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getPost, repostPost } from "@/shared/api/posts/posts-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { Button } from "@/shared/components/atoms/button";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { TextBox } from "@/shared/components/atoms/jumping-input/jumping-input";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { getTextboxData } from "@/shared/utils/process-textbox-data";

interface ModalRepostProps {
  id: string;
  store?: unknown;
}

export function ModalRepost({ id, store }: ModalRepostProps) {
  const user = ownerAccountStore.getState().user;
  const { hidePopup } = usePopupStore();
  const textbox = useRef<HTMLDivElement>(null);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [post, setPost] = useState<Record<string, unknown> | null>(null);

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

  const handleRepost = async () => {
    const { innerText, innerHTML } = getTextboxData(textbox as React.RefObject<HTMLElement>);
    setSubmitClicked(true);
    const formData = new FormData();
    formData.append("userId", user?.userId ?? "");
    formData.append("text", innerText ?? "");
    formData.append("HTMLText", innerHTML ?? "");
    formData.append("originPostId", id);
    const resp = (await repostPost(formData)) as { statusCode?: number } | null;
    setSubmitClicked(false);
    if (!resp || resp.statusCode !== 200) {
      toast.error("Đăng bài viết thất bại");
      return;
    }
    toast.success("Đăng bài viết thành công");
    hidePopup();
  };

  return (
    <div className="relative pt-11 flex flex-col sm:w-[550px] w-screen sm:h-fit sm:max-h-[90dvh] h-[100dvh]">
      <div className="mt-3 flex-grow space-y-2 overflow-y-auto px-4">
        <div className="flex items-center space-x-2">
          <Avatar className="size-9">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback className="text-[11px] font-medium">{user.displayName}</AvatarFallback>
          </Avatar>
          <span className="font-semibold">{user.displayName}</span>
        </div>

        <TextBox
          texboxRef={textbox}
          placeholder="Hãy viết gì đó..."
          className="min-h-[80px] py-2"
          innerHTML=""
          autoFocus
        />

        {post && (
          <div className="border rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-semibold">{post.displayName as string}</p>
            <p className="mt-1">{post.text as string}</p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 p-3 bg-background border-t">
        <Button
          type="button"
          variant="ghost"
          className={`btn-primary py-2.5 w-full ${submitClicked ? "opacity-50" : ""}`}
          onClick={handleRepost}
        >
          {submitClicked ? <LoadingIcon /> : "Đăng lại"}
        </Button>
      </div>
    </div>
  );
}
