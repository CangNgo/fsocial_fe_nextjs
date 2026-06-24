"use client";
import { useState } from "react";
import { toast } from "sonner";
import { deletePost } from "@/shared/api/posts/posts-api";
import { LoadingIcon, TrashCanIcon } from "@/shared/components/atoms/icon/icon";
import { Button } from "@/shared/components/ui/button";
import { usePopupStore } from "@/shared/stores/popup-store";

interface DeletePostModalProps {
  id: string;
  store?: (
    selector: (s: { deletePost: (id: string) => void }) => (id: string) => void,
  ) => (id: string) => void;
}

export function DeletePostModal({ id, store }: DeletePostModalProps) {
  const { hidePopup } = usePopupStore();
  const deletePostInStore = store ? store((state) => state.deletePost) : null;
  const [deleteClicked, setDeleteClicked] = useState(false);

  const handleDelete = async () => {
    setDeleteClicked(true);
    const resp = (await deletePost(id)) as { statusCode?: number } | null;
    if (resp?.statusCode === 200) {
      toast.success("Đã xóa bài viết");
      deletePostInStore?.(id);
      hidePopup();
    } else {
      toast.error("Xóa bài viết thất bại");
      setDeleteClicked(false);
    }
  };

  return (
    <div className="pt-10 sm:w-[500px] w-[90vw]">
      <div className="flex justify-center my-4">
        <img src="/decor/delete_post_decor.svg" alt="" className="w-36 h-36" />
      </div>
      <h5 className="font-normal text-center">
        Sau khi xóa, bài viết sẽ <span className="text-primary font-semibold">không thể</span> khôi
        phục.
        <br /> Bạn vẫn xác nhận xóa?
      </h5>
      <div className="p-3 flex justify-between mt-6 gap-3">
        <Button
          type="button"
          variant="ghost"
          className="btn-primary py-3 flex-1"
          onClick={hidePopup}
        >
          Hủy bỏ xóa
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`btn-secondary py-3 flex-1 gap-2 ${deleteClicked ? "opacity-50" : ""}`}
          onClick={handleDelete}
        >
          {deleteClicked ? (
            <LoadingIcon />
          ) : (
            <>
              <TrashCanIcon className="size-5" />
              <span>Xác nhận xóa</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
