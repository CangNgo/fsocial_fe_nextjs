import { cn } from "@/shared/lib/utils";
import { Image } from "../atoms/image";

interface LayoutTwoProps {
  images: string[];
  className?: string;
}

export default function LayoutTwo({ images, className }: LayoutTwoProps) {
  return (
    <div className={cn("grid grid-cols-2 ", className)}>
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={`Media ${index}`}
          width={0}
          height={0}
          sizes="100vw"
          quality={100}
          className="h-full w-full object-cover "
        />
      ))}
    </div>
  );
}