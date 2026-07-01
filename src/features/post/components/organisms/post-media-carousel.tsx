"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { type MediaResponse, MediaType } from "@/shared/types/media";
import { Image } from "@/shared/components/atoms/image";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { cn } from "@/shared/lib/utils";

interface PostMediaCarouselProps {
  media: MediaResponse[];
  initialIndex?: number;
  className?: string;
}

export function PostMediaCarousel({ media, initialIndex = 0, className }: PostMediaCarouselProps) {
  const images = media.filter((m) => m.type === MediaType.IMAGE);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  if (images.length === 0) return null;

  return (
    <div className={cn("relative w-full bg-black", className)}>
      <Carousel
        setApi={setApi}
        opts={{ loop: images.length > 1, startIndex: initialIndex }}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {images.map((m, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: media list is fixed per post, never reordered
            <CarouselItem key={`${m.url}-${index}`} className="pl-0">
              <div className="relative h-[60vh] w-full sm:h-[70vh]">
                <Image
                  src={m.url}
                  alt="Image"
                  fill
                  sizes="100vw"
                  quality={100}
                  className="object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {images.length > 1 && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 left-2 rounded-full"
            onClick={() => api?.scrollPrev()}
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="-translate-y-1/2 absolute top-1/2 right-2 rounded-full"
            onClick={() => api?.scrollNext()}
          >
            <ChevronRight className="size-5" />
          </Button>
          <div className="absolute right-2 bottom-2 rounded-full border bg-background px-2 py-0.5 text-xs shadow-lg">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
