"use client";

import { getPost } from "@/services/posts/posts-api";
import { Image } from "@/shared/components/atoms/image";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { getImageSize, getVideoSize } from "@/shared/utils/get-size-element";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

export interface ProcessedMedia {
  src: string;
  type: "image" | "video" | "post";
}

interface Dimensions {
  width: number;
  height: number;
}

export interface MediaGridProps {
  medias: ProcessedMedia[];
  allowCarousel?: boolean;
  mediaCallback?: () => void;
  /** Optional Zustand store with updatePost action */
  store?: unknown;
  blockEvent?: boolean;
  isShared?: boolean;
  /** Render the embedded repost PostCard — pass the component to avoid circular dep */
  PostCardComponent?: React.ComponentType<{
    post: Record<string, unknown>;
    isChildren?: boolean;
    showReact?: boolean;
    className?: string;
    isShared?: boolean;
    store?: unknown;
    blockEvent?: boolean;
  }>;
}

const FALLBACK_LAYOUT = "gap-0.5 grid grid-cols-2 [&>*]:aspect-square";
const mediaLayoutCache = new Map<string, string>();

const buildMediaLayoutCacheKey = (medias: ProcessedMedia[]) =>
  medias.map((media) => `${media.type}:${media.src}`).join("|");

const calculateNumberOfScales = (dimensions: Dimensions[]) => {
  return dimensions.reduce(
    (counts, curr) => {
      const ratio = curr.width / curr.height;

      if (ratio === 1) {
        counts.numberSquare += 1;
      } else if (ratio > 1) {
        counts.numberHorizontal += 1;
      } else {
        counts.numberVertical += 1;
      }

      return counts;
    },
    { numberSquare: 0, numberHorizontal: 0, numberVertical: 0 },
  );
};

const getCachedLayout = (medias: ProcessedMedia[]) => {
  return mediaLayoutCache.get(buildMediaLayoutCacheKey(medias)) ?? null;
};

const cacheLayout = (medias: ProcessedMedia[], layout: string) => {
  mediaLayoutCache.set(buildMediaLayoutCacheKey(medias), layout);
};

const genFallbackLayout = (medias: ProcessedMedia[]) => {
  switch (medias.length) {
    case 0:
      return null;
    case 1:
      return "size-full max-h-[calc(100%*9/16)]";
    case 2:
      return "gap-0.5 grid grid-cols-2 [&>*]:aspect-square";
    default:
      return FALLBACK_LAYOUT;
  }
};

const genClassLayout = async (medias: ProcessedMedia[]): Promise<string> => {
  const cachedLayout = getCachedLayout(medias);
  if (cachedLayout) {
    return cachedLayout;
  }

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

  let layout = FALLBACK_LAYOUT;

  switch (medias.length) {
    case 1:
      layout = "size-full max-h-[calc(100%*9/16)]";
      break;

    case 2: {
      const { numberHorizontal, numberVertical } = calculateNumberOfScales(dimensions);
      if (numberHorizontal === 2) {
        layout = "gap-0.5 aspect-square grid grid-rows-2";
      } else if (numberVertical === 2) {
        layout = "gap-0.5 aspect-square grid grid-cols-2";
      } else {
        layout = "gap-0.5 grid grid-cols-2 [&>*]:aspect-square";
      }
      break;
    }

    case 3: {
      const { numberHorizontal, numberSquare, numberVertical } =
        calculateNumberOfScales(dimensions);
      const effectiveHorizontal = numberHorizontal + numberSquare;
      layout =
        effectiveHorizontal > numberVertical
          ? "grid gap-0.5 grid-cols-2 aspect-square [&>:nth-child(1)]:col-span-2"
          : "grid gap-0.5 grid-cols-[auto_auto] aspect-square [&>:nth-child(1)]:row-span-2 [&>:nth-child(1)]:w-full [&>:not(:nth-child(1))]:w-full";
      break;
    }

    case 4: {
      const firstRatio = dimensions[0].width / dimensions[0].height;
      if (firstRatio > 1) {
        layout =
          "grid gap-0.5 grid-cols-3 [&>:nth-child(1)]:col-span-3 [&>:not(:nth-child(1))]:aspect-square";
      } else if (firstRatio === 1) {
        layout = "grid gap-0.5 grid-cols-2 grid-rows-2 aspect-square";
      } else {
        layout =
          "aspect-square grid gap-0.5 grid-cols-[auto_auto] grid-rows-3 [&>:nth-child(1)]:row-span-3";
      }
      break;
    }

    default: {
      const { numberHorizontal, numberSquare, numberVertical } = calculateNumberOfScales(
        dimensions.slice(2, 6),
      );
      const effectiveHorizontal = numberHorizontal + numberSquare;
      layout =
        effectiveHorizontal > numberVertical
          ? `
          aspect-square grid gap-0.5 grid-flow-col grid-cols-[auto_auto] grid-rows-6
          [&>:nth-child(1)]:row-span-3
          [&>:nth-child(2)]:row-span-3
          [&>:nth-child(3)]:row-span-2
          [&>:nth-child(4)]:row-span-2
          [&>:nth-child(5)]:row-span-2`
          : `
        aspect-square grid gap-0.5 grid-cols-6 grid-rows-[auto_auto]
        [&>:nth-child(1)]:col-span-3
        [&>:nth-child(2)]:col-span-3
        [&>:nth-child(3)]:col-span-2
        [&>:nth-child(4)]:col-span-2
        [&>:nth-child(5)]:col-span-2`;
    }
  }

  cacheLayout(medias, layout);
  return layout;
};

const areMediaListsEqual = (left: ProcessedMedia[], right: ProcessedMedia[]) => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((media, index) => {
    const rightMedia = right[index];
    return media.src === rightMedia?.src && media.type === rightMedia?.type;
  });
};

const MediaGridComponent = ({
  medias,
  allowCarousel = false,
  mediaCallback = () => {},
  store,
  blockEvent,
  isShared = false,
  PostCardComponent,
}: MediaGridProps) => {
  const isPost = medias.length === 1 && medias[0].type === "post";
  const cachedLayout = useMemo(() => getCachedLayout(medias), [medias]);
  const fallbackLayout = useMemo(() => genFallbackLayout(medias), [medias]);
  const [post, setPost] = useState<Record<string, unknown> | null>(null);

  const handleGetPost = useCallback(async (postId: string) => {
    const user = ownerAccountStore.getState().user;
    if (!user?.id) return;
    const resp = (await getPost(user.id, postId)) as {
      statusCode?: number;
      data?: Record<string, unknown>;
    } | null;
    if (resp?.statusCode !== 200) return;
    setPost(resp.data ?? null);
  }, []);

  useEffect(() => {
    if (isPost) {
      queueMicrotask(() => {
        handleGetPost(medias[0].src);
      });
    }
  }, [handleGetPost, isPost, medias]);

  const router = useRouter();
  const handleToOriginPost = useCallback(() => {
    const postId = typeof post?.id === "string" ? post.id : null;
    if (!blockEvent && postId) router.push(ROUTES.POST(postId));
  }, [blockEvent, post, router]);

  const effectiveAllowCarousel = allowCarousel && medias.length > 1;
  const handleMediaClick = useCallback(() => {
    if (!effectiveAllowCarousel) {
      mediaCallback();
    }
  }, [effectiveAllowCarousel, mediaCallback]);

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api || isPost || !effectiveAllowCarousel) return;
    queueMicrotask(() => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, isPost, effectiveAllowCarousel]);

  const [classLayout, setClassLayout] = useState<string | null>(cachedLayout ?? fallbackLayout);

  useEffect(() => {
    queueMicrotask(() => {
      setClassLayout(cachedLayout ?? fallbackLayout);
    });
  }, [cachedLayout, fallbackLayout]);

  useEffect(() => {
    if (effectiveAllowCarousel) {
      queueMicrotask(() => {
        setClassLayout(null);
      });
      return;
    }

    if (cachedLayout) {
      queueMicrotask(() => {
        setClassLayout(cachedLayout);
      });
      return;
    }

    let isMounted = true;
    queueMicrotask(() => {
      setClassLayout(fallbackLayout);
    });

    genClassLayout(medias).then((layout) => {
      if (isMounted) {
        setClassLayout(layout);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [cachedLayout, effectiveAllowCarousel, fallbackLayout, medias]);

  if (medias.length === 0) return null;

  const resolvedClassLayout = classLayout ?? fallbackLayout;

  return (
    <div
      className={cn(
        "relative transition",
        isShared && "scale-95 mx-auto w-[95%]",
        !isPost && !effectiveAllowCarousel
          ? cn("border-y border-x-0", resolvedClassLayout)
          : "border-b",
      )}
    >
      {!isPost && resolvedClassLayout && !effectiveAllowCarousel && (
        <Button type="button" onClick={handleMediaClick} className="contents">
          {medias.slice(0, 5).map((media, index) => (
            <div key={media.src} className="relative overflow-hidden size-full">
              {media.type === "image" && (
                <Image
                  src={media.src}
                  alt="Bài đăng"
                  fill
                  sizes="(max-width: 1024px) 100vw, 630px"
                  className="object-cover object-center"
                />
              )}
              {media.type === "video" && (
                <video
                  src={media.src}
                  preload="metadata"
                  controls
                  className="size-full object-cover object-center"
                />
              )}
              {medias.length > 5 && index === 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white">
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
          <Carousel setApi={setApi} className="mx-auto w-[80%]">
            <CarouselContent className="max-h-[70vh]">
              {medias.map((media) => (
                <CarouselItem key={media.src} className="pl-3">
                  {media.type === "image" && (
                    <Image
                      src={media.src}
                      alt="Bài đăng"
                      width={0}
                      height={0}
                      sizes="80vw"
                      className="size-full object-contain"
                    />
                  )}
                  {media.type === "video" && (
                    <div className="grid size-full place-content-center object-contain">
                      {/* biome-ignore lint/a11y/useMediaCaption: user-uploaded media has no caption track available */}
                      <video src={media.src} preload="metadata" controls />
                    </div>
                  )}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:inline-flex" />
            <CarouselNext className="hidden sm:inline-flex" />
          </Carousel>
          <div className="absolute bottom-2 right-2 rounded-full border bg-background px-2 shadow-lg fs-xs">
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
            className="pointer-events-none overflow-hidden rounded-lg border-t"
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
          className="block w-full cursor-pointer rounded-lg border-t p-4 text-left transition hover:bg-accent/40"
        >
          <p className="text-sm text-muted-foreground">Xem bài viết gốc</p>
        </Button>
      )}
    </div>
  );
};

export const MediaGrid = memo(MediaGridComponent, (prevProps, nextProps) => {
  return (
    prevProps.allowCarousel === nextProps.allowCarousel &&
    prevProps.blockEvent === nextProps.blockEvent &&
    prevProps.isShared === nextProps.isShared &&
    prevProps.mediaCallback === nextProps.mediaCallback &&
    prevProps.store === nextProps.store &&
    prevProps.PostCardComponent === nextProps.PostCardComponent &&
    areMediaListsEqual(prevProps.medias, nextProps.medias)
  );
});

MediaGrid.displayName = "MediaGrid";
