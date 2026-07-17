import { cn } from "@/shared/lib/utils";
import { MediaResponse, MediaType } from "@/shared/types/post";
import LayoutFour from "./layout-four";
import LayoutOne from "./layout-one";
import LayoutThree from "./layout-three";
import LayoutTwo from "./layout-two";

interface MediaLayoutProps {
  medias: MediaResponse[] | undefined;
  className?: string;
}
export default function MediaLayout({ medias, className }: MediaLayoutProps) {
  if (!medias || medias.length === 0) return null;
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <GenerateLayout media={medias} />
    </div>
  );
}

interface GenerateLayoutProps {
  media: MediaResponse[];
}
const GenerateLayout = ({ media }: GenerateLayoutProps) => {
  const images = media.filter((m) => m.type === MediaType.IMAGE).map((m) => m.url);
  const count = images.length;
  if (count === 1) {
    return <LayoutOne image={images} />;
  }
  if (count === 2) {
    return <LayoutTwo images={images} />;
  }
  if (count === 3) {
    return <LayoutThree images={images} />;
  }
  if (count === 4) {
    return <LayoutFour images={images} />;
  }
  // if (count === 5) {
  //   return (
  //     <LayoutFive images={media} />
  //   )
  // }

  return <div>hello</div>;
};
