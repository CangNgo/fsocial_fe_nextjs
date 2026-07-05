"use client";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { repostPost } from "@/shared/api/posts/posts-api";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import type { PostCardStore } from "../../hooks/use-post-card-actions";
import { usePostForModal } from "../../hooks/use-post-for-modal";

interface ModalRepostProps {
  id: string;
  store?: PostCardStore;
}

export function ModalRepost({ id, store }: ModalRepostProps) {
  const user = ownerAccountStore.getState().user;
  const { hidePopup } = usePopupStore();
  const textbox = useRef<HTMLTextAreaElement>(null);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [content, setContent] = useState("");
  const { post } = usePostForModal({ id, store });

  const handleRepost = async () => {
    setSubmitClicked(true);
    const formData = new FormData();
    formData.append("userId", user?.id ?? "");
    formData.append("text", content);
    formData.append("HTMLText", content);
    formData.append("originPostId", id);
    const resp = (await repostPost(formData)) as { statusCode?: number } | null;
    setSubmitClicked(false);
    if (resp?.statusCode !== 200) {
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
          <UserAvatar src={user?.avatar} displayName={user?.displayName} className="size-9" />
          <span className="font-semibold">{user.displayName}</span>
        </div>

        <Textarea
          ref={textbox}
          placeholder="Hãy viết gì đó..."
          className="min-h-[80px] py-2 resize-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
