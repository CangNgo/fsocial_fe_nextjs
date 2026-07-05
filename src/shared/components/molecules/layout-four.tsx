import { cn } from "@/shared/lib/utils";
import { Image } from "../atoms/image";

interface LayoutFourProps {
  images: string[];
  className?: string;
}

export default function LayoutFour({ images, className }: LayoutFourProps) {
  return (
    <div className={cn("grid grid-cols-2", className)}>
      {images.map((src, index) => (
        <div key={src} className="aspect-square overflow-hidden">
          <Image
            src={src}
            alt={`Media ${index}`}
            width={0}
            height={0}
            sizes="50vw"
            quality={100}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
