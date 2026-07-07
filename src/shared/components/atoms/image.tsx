import NextImage, { type ImageProps } from "next/image";

const DEFAULT_IMAGE_SRC = "/images/default-image.jpg";

interface IImageProps extends Omit<ImageProps, "src"> {
  src: string | undefined | null;
}

export const Image = ({ src, ...props }: IImageProps) => {
  const resolvedSrc = src && src !== "" ? src : DEFAULT_IMAGE_SRC;

  /* SVG bị optimizer từ chối (image/svg+xml), blob:/data: là URL cục bộ (preview upload)
   * nên không đi qua /_next/image được — render thẳng như <img>. */
  const unoptimized =
    resolvedSrc.startsWith("blob:") ||
    resolvedSrc.startsWith("data:") ||
    resolvedSrc.split("?")[0].toLowerCase().endsWith(".svg");

  return <NextImage unoptimized={unoptimized} {...props} src={resolvedSrc} />;
};
