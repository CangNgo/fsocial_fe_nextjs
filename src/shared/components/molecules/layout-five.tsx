import { cn } from "@/shared/lib/utils";
import { Image } from "../atoms/image";

interface LayoutFiveProps {
  images: string[];
  className?: string;
}

export default function LayoutFive({ images, className }: LayoutFiveProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={`Media ${index}`}
          fill
          className="object-cover rounded-lg"
        />
      ))}
    </div>
  );
}
