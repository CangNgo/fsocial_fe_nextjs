"use client";

import {
  CommentPostIcon,
  HeartPostIcon,
  RepostPostIcon,
  SharePostIcon
} from "@/shared/components/atoms/icon/icon";
import { PhotoGrid } from "@/shared/components/organisms/photo-grid";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { MediaType, PostResponse } from "@/shared/types/post";
import type { Dispatch, SetStateAction } from "react";
import { memo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Video from "yet-another-react-lightbox/plugins/video";
import "yet-another-react-lightbox/styles.css";
import {
  type PostCardPost,
  type PostCardStore,
  usePostCardActions,
} from "../../hooks/use-post-card-actions";
import { PostMediaCarousel } from "../organisms/post-media-carousel";
import { PostCardHeader } from "./post-card-header";
import ShowContent from "./show-content";

export interface PostCardProps {
  post: PostResponse;
  setPost?: Dispatch<SetStateAction<PostCardPost>>;
  showReact?: boolean;
  className?: string;
  store?: PostCardStore;
  allowCarousel?: boolean;
  initialMediaIndex?: number;
  priority?: boolean;
}

function PostCardComponent({
  post,
  setPost,
  showReact = true,
  className = "",
  store,
  allowCarousel = false,
  initialMediaIndex,
  priority = false,
}: PostCardProps) {
  const {
    liked,
    showCommentPopup,
    showRepostPopup,
    handleLike,
  } = usePostCardActions({ post, setPost, store });

  const originPost: PostResponse = post.postOriginResponse;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const media = (post?.share ? originPost.content.media : post.content.media) || [];

  return (
    <article className={cn(className, "transition p-2")}>
      {post?.share && (
        <div className="">
          <PostCardHeader post={post} setPost={setPost} store={store} />
          <ShowContent content={post.content} />
        </div>
      )}
      <div className={`${post?.share && ("p-2 pt-0 rounded-2xl border max-w-[96%] mx-auto")}`}>
        <PostCardHeader post={post.share ? originPost : post} setPost={setPost} store={store} />
        <div >
          <ShowContent content={post.share ? originPost.content : post.content} />
          {allowCarousel ? (
            <PostMediaCarousel
              media={media}
              initialIndex={initialMediaIndex ?? 0}
            />
          ) : (
            <PhotoGrid
              media={media}
              priority={priority}
              onImageClick={(_, index) => setLightboxIndex(index)}
            />
          )}
        </div>

        <Lightbox
          open={lightboxIndex !== null}
          close={() => setLightboxIndex(null)}
          index={lightboxIndex ?? 0}
          plugins={[Video]}
          video={{ autoPlay: true }}
          slides={media.map((m) =>
            m.type === MediaType.VIDEO
              ? { type: "video" as const, sources: [{ src: m.url, type: "video/mp4" }] }
              : { src: m.url },
          )}
        />
      </div>
      {showReact && (
        <div className="px-4 sm:py-2 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent border-none shadow-none"
              onClick={handleLike}
            >
              <HeartPostIcon compareVar={liked} />
              <span className="sm:block hidden">{post.countLikes || originPost?.countLikes}</span>
            </Button>

            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent border-none shadow-none"
              onClick={() => showCommentPopup()}
            >
              <CommentPostIcon />
              <span className="sm:block hidden">{post.countComments || originPost?.countComments}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={"outline"}
              className="flex items-center sm:gap-2 gap-1 cursor-pointer hover:bg-transparent border-none shadow-none"
              onClick={showRepostPopup}
            >
              <RepostPostIcon />
            </Button>

            <div className="flex items-center gap-2 cursor-pointer">
              <SharePostIcon />
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

const PostCard = memo(PostCardComponent);

PostCard.displayName = "PostCard";

export default PostCard;
