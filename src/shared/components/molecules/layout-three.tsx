import { cn } from "@/shared/lib/utils";
import { Image } from "../atoms/image";

interface LayoutThreeProps {
  images: string[];
  className?: string;
}

export default function LayoutThree({ images, className }: LayoutThreeProps) {
  return (
    <div className={cn("grid grid-cols-2", className)}>
      <div className="col-span-2 aspect-video">
        {images[0] && (
          <Image
            src={images[0]}
            alt="Media 0"
            width={0}
            height={0}
            sizes="100vw"
            quality={100}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      {images.slice(1).map((src, index) => (
        <div key={index} className="aspect-square">
          <Image
            src={src}
            alt={`Media ${index + 1}`}
            width={0}
            height={0}
            sizes="100vw"
            quality={100}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
