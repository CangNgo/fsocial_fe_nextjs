import { MediaType } from "@/shared/types/post";
import NextImage, { type ImageProps } from "next/image";

const DEFAULT_IMAGE_SRC = "/images/default-image.jpg";

interface IImageProps extends Omit<ImageProps, "src"> {
  src: string | undefined | null;
  type?: MediaType;
}

export const Image = ({ src, type = MediaType.IMAGE, ...props }: IImageProps) => {
  const resolvedSrc = src && src !== "" ? src : DEFAULT_IMAGE_SRC;

  if (type === MediaType.VIDEO) {
    const { className, style } = props;
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video
        src={resolvedSrc}
        className={className}
        style={style as React.CSSProperties}
        controls
        preload="metadata"
        playsInline
      />
    );
  }

  /* SVG bị optimizer từ chối (image/svg+xml), blob:/data: là URL cục bộ (preview upload)
   * nên không đi qua /_next/image được — render thẳng như <img>. */
  const unoptimized =
    resolvedSrc.startsWith("blob:") ||
    resolvedSrc.startsWith("data:") ||
    resolvedSrc.split("?")[0].toLowerCase().endsWith(".svg");

  return <NextImage unoptimized={unoptimized} {...props} src={resolvedSrc} />;
};
