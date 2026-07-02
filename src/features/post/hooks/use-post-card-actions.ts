"use client";

import type { Dispatch, SetStateAction } from "react";
import { createElement, useCallback, useState } from "react";
import { likePost } from "@/shared/api/posts/posts-api";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import type { MediaResponse } from "@/shared/types/media";
import { CommentModal } from "../components/organisms/comment-modal";
import { DeletePostModal } from "../components/organisms/delete-post-modal";
import { EditPostModal } from "../components/organisms/edit-post-modal";
import { ModalRepost } from "../components/organisms/modal-repost";
import { ReportModal } from "../components/organisms/report-modal";

interface PostCardContent {
  text?: string;
  htmltext?: string;
  media?: MediaResponse[];
}

export interface PostCardPost {
  id: string;
  userId: string;
  originPostId?: string | null;
  displayName?: string;
  avatar?: string | null;
  createDatetime: string;
  content?: PostCardContent;
  countLikes: number;
  countComments: number;
  like: boolean;
  repost?: number;
}

interface PostStoreState {
  updatePost: (id: string, values: Partial<PostCardPost>) => void;
  deletePost: (id: string) => void;
}

export type PostCardStore = (<T>(selector: (state: PostStoreState) => T) => T) | undefined;

interface UsePostCardActionsOptions {
  post: PostCardPost;
  setPost?: Dispatch<SetStateAction<PostCardPost>>;
  store?: PostCardStore;
}

export function usePostCardActions({ post, setPost, store }: UsePostCardActionsOptions) {
  const { showPopup } = usePopupStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const user = ownerAccountStore.getState().user;
  const updatePost = store ? store((state) => state.updatePost) : undefined;

  const likes = post.countLikes;
  const liked = post.like;

  const showCommentPopup = useCallback(
    (initialMediaIndex?: number) => {
      showPopup(
        `Bài viết của ${post.displayName ?? ""}`,
        createElement(CommentModal, { id: post.id, store, initialMediaIndex }),
      );
    },
    [post.displayName, post.id, showPopup, store],
  );

  const showRepostPopup = useCallback(() => {
    showPopup(
      "Đăng lại bài viết",
      createElement(ModalRepost, { id: post.originPostId || post.id, store }),
    );
  }, [post.id, post.originPostId, showPopup, store]);

  const handlePopupReport = useCallback(() => {
    setPopoverOpen(false);
    showPopup("Báo cáo vi phạm", createElement(ReportModal, { id: post.id }));
  }, [post.id, showPopup]);

  const handlePopupEdit = useCallback(() => {
    setPopoverOpen(false);
    showPopup("Chỉnh sửa bài viết", createElement(EditPostModal, { id: post.id, store }));
  }, [post.id, showPopup, store]);

  const handlePopupDelete = useCallback(() => {
    setPopoverOpen(false);
    showPopup("Xóa bài viết", createElement(DeletePostModal, { id: post.id, store }));
  }, [post.id, showPopup, store]);

  const handleLike = useCallback(async () => {
    const nextValues = {
      like: !liked,
      countLikes: liked ? likes - 1 : likes + 1,
    };

    if (setPost) {
      setPost((prev) => ({
        ...prev,
        ...nextValues,
      }));
    }
    updatePost?.(post.id, nextValues);
    likePost(post.id);
  }, [liked, likes, post.id, setPost, updatePost]);

  return {
    user,
    likes,
    liked,
    popoverOpen,
    setPopoverOpen,
    showCommentPopup,
    showRepostPopup,
    handlePopupReport,
    handlePopupEdit,
    handlePopupDelete,
    handleLike,
  };
}
