// @ts-nocheck
"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/button";
import type { CarouselApi } from "@/components/atoms/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/atoms/carousel";
import { getPost } from "@/lib/api/posts/postsApi";
import { cn } from "@/lib/utils";
import { ownerAccountStore } from "@/store/ownerAccountStore";
import { getImageSize, getVideoSize } from "@/utils/getSizeElement";

export interface ProcessedMedia {
  src: string;
  type: "image" | "video" | "post";
}

interface Dimensions {
  width: number;
  height: number;
}

const calculateNumberOfScales = (dimensions: Dimensions[]) => {
  const numberSquare = dimensions.reduce(
    (sum, curr) => (curr.width / curr.height === 1 ? sum + 1 : sum),
    0,
  );
  const numberHorizontal = dimensions.reduce(
    (sum, curr) => (curr.width / curr.height > 1 ? sum + 1 : sum),
    0,
  );
  const numberVertical = dimensions.length - numberSquare - numberHorizontal;
  return { numberSquare, numberHorizontal, numberVertical };
};

const genClassLayout = async (medias: ProcessedMedia[]): Promise<string> => {
  const dimensions = await Promise.all(
    medias.map((media) => {
      if (media.type === "image") {
        return getImageSize(media.src).catch(() => ({ width: 1, height: 1 }));
      }
      if (media.type === "video") {
        return getVideoSize(media.src).catch(() => ({ width: 1, height: 1 }));
      }
      return Promise.resolve({ width: 1, height: 1 });
    }),
  );

  switch (medias.length) {
    case 1:
      return "size-full max-h-[calc(100%*9/16)]";

    case 2: {
      const { numberHorizontal, numberVertical } = calculateNumberOfScales(dimensions);
      if (numberHorizontal === 2) return "gap-0.5 aspect-square grid grid-rows-2";
      if (numberVertical === 2) return "gap-0.5 aspect-square grid grid-cols-2";
      return "gap-0.5 grid grid-cols-2 [&>*]:aspect-square";
    }

    case 3: {
      let { numberHorizontal, numberSquare, numberVertical } = calculateNumberOfScales(dimensions);
      numberHorizontal += numberSquare;
      if (numberHorizontal > numberVertical) {
        return "grid gap-0.5 grid-cols-2 aspect-square [&>:nth-child(1)]:col-span-2";
      }
      return "grid gap-0.5 grid-cols-[auto_auto] aspect-square [&>:nth-child(1)]:row-span-2 [&>:nth-child(1)]:w-full [&>:not(:nth-child(1))]:w-full";
    }

    case 4: {
      const firstRatio = dimensions[0].width / dimensions[0].height;
      if (firstRatio > 1)
        return "grid gap-0.5 grid-cols-3 [&>:nth-child(1)]:col-span-3 [&>:not(:nth-child(1))]:aspect-square";
      if (firstRatio === 1) return "grid gap-0.5 grid-cols-2 grid-rows-2 aspect-square";
      return "aspect-square grid gap-0.5 grid-cols-[auto_auto] grid-rows-3 [&>:nth-child(1)]:row-span-3";
    }

    default: {
      let { numberHorizontal, numberSquare, numberVertical } = calculateNumberOfScales(
        dimensions.slice(2, 6),
      );
      numberHorizontal += numberSquare;
      if (numberHorizontal > numberVertical)
        return `
          aspect-square grid gap-0.5 grid-flow-col grid-cols-[auto_auto] grid-rows-6
          [&>:nth-child(1)]:row-span-3
          [&>:nth-child(2)]:row-span-3
          [&>:nth-child(3)]:row-span-2
          [&>:nth-child(4)]:row-span-2
          [&>:nth-child(5)]:row-span-2`;
      return `
        aspect-square grid gap-0.5 grid-cols-6 grid-rows-[auto_auto]
        [&>:nth-child(1)]:col-span-3
        [&>:nth-child(2)]:col-span-3
        [&>:nth-child(3)]:col-span-2
        [&>:nth-child(4)]:col-span-2
        [&>:nth-child(5)]:col-span-2`;
    }
  }
};

export interface MediaGridProps {
  medias: ProcessedMedia[];
  allowCarousel?: boolean;
  mediaCallback?: () => void;
  /** Optional Zustand store with updatePost action */
  store?: any;
  blockEvent?: boolean;
  isShared?: boolean;
  /** Render the embedded repost PostCard — pass the component to avoid circular dep */
  PostCardComponent?: React.ComponentType<any>;
}

export function MediaGrid({
  medias,
  allowCarousel = false,
  mediaCallback = () => {},
  store,
  blockEvent,
  isShared = false,
  PostCardComponent,
}: MediaGridProps) {
  const isPost = medias.length === 1 && medias[0].type === "post";
  const [post, setPost] = useState<any>(null);

  const handleGetPost = async (postId: string) => {
    const user = ownerAccountStore.getState().user;
    if (!user) return;
    const resp = (await getPost(user.userId, postId)) as any;
    if (!resp || resp.statusCode !== 200) return;
    setPost(resp.data);
  };

  useEffect(() => {
    if (isPost) handleGetPost(medias[0].src);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medias[0].src, isPost, handleGetPost]);

  const router = useRouter();
  const handleToOriginPost = () => {
    if (!blockEvent && post) router.push(`/post?id=${post.id}`);
  };

  const handleMediaClick = () => {
    if (!effectiveAllowCarousel) mediaCallback();
  };

  const effectiveAllowCarousel = allowCarousel && medias.length > 1;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api || isPost || !effectiveAllowCarousel) return;
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, isPost, effectiveAllowCarousel]);

  const [classLayout, setClassLayout] = useState<string | null>(null);

  useEffect(() => {
    if (!effectiveAllowCarousel) {
      genClassLayout(medias).then(setClassLayout);
    }
  }, [medias, effectiveAllowCarousel]);

  if (medias.length === 0) return null;

  return (
    <div
      className={cn(
        "relative transition",
        isShared && "scale-95 mx-auto w-[95%]",
        !isPost && !effectiveAllowCarousel ? cn("border-y border-x-0", classLayout) : "border-b",
      )}
    >
      {!isPost && classLayout && !effectiveAllowCarousel && (
        <Button type="button" onClick={handleMediaClick} className="contents">
          {medias.slice(0, 5).map((media, index) => (
            <div key={media.src} className="relative overflow-hidden size-full">
              {media.type === "image" && (
                <img
                  src={media.src}
                  alt="Bài đăng"
                  className="size-full object-cover object-center"
                />
              )}
              {media.type === "video" && (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded media has no caption track available
                <video src={media.src} controls className="size-full object-cover object-center" />
              )}
              {medias.length > 5 && index === 4 && (
                <div className="absolute inset-0 bg-black text-white bg-opacity-60 flex items-center justify-center">
                  <Plus className="size-7" />
                  <span className="text-2xl">{medias.length - 1 - index}</span>
                </div>
              )}
            </div>
          ))}
        </Button>
      )}

      {!isPost && effectiveAllowCarousel && (
        <div className="relative border-t border-x-0">
          <Carousel setApi={setApi} className="w-[80%] mx-auto">
            <CarouselContent className="max-h-[70vh]">
              {medias.map((media, index) => (
                <CarouselItem key={media.src} className="pl-3">
                  {media.type === "image" && (
                    <img src={media.src} alt="Bài đăng" className="size-full object-contain" />
                  )}
                  {media.type === "video" && (
                    <div className="size-full object-contain grid place-content-center">
                      {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded media has no caption track available */}
                      <video src={media.src} controls />
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="sm:inline-flex hidden" />
            <CarouselNext className="sm:inline-flex hidden" />
          </Carousel>
          <div className="fs-xs px-2 bg-background shadow-lg border rounded-full absolute bottom-2 right-2">
            {current} / {medias.length}
          </div>
        </div>
      )}

      {post && PostCardComponent && (
        <Button type="button" onClick={handleToOriginPost} className="block w-full text-left">
          <PostCardComponent
            post={post}
            isChildren={true}
            showReact={false}
            className="border-t rounded-lg overflow-hidden pointer-events-none"
            isShared={true}
            store={store}
            blockEvent={blockEvent}
          />
        </Button>
      )}

      {post && !PostCardComponent && (
        <Button
          type="button"
          onClick={handleToOriginPost}
          className="block w-full text-left border-t p-4 rounded-lg cursor-pointer hover:bg-accent/40 transition"
        >
          <p className="text-sm text-muted-foreground">Xem bài viết gốc</p>
        </Button>
      )}
    </div>
  );
}
