import { cn } from "@/shared/lib/utils";
import { Image } from "../atoms/image";

interface LayoutOneProps {
  image: string[];
  className?: string;
}

export default function LayoutOne({ image, className }: LayoutOneProps) {
  return (
    <div className={cn("grid grid-cols-1 ", className)}>
      <Image
        src={image[0]}
        alt="Media"
        width={0}
        height={0}
        sizes="100vw"
        quality={100}
        className="h-auto max-h-[80vh] w-full object-cover"
      />
    </div>
  );
}