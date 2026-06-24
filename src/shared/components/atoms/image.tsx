import NextImage, { type ImageProps } from "next/image";

const DEFAULT_IMAGE_SRC = "/images/default-image.jpg";

interface IImageProps extends Omit<ImageProps, "src"> {
  src: string | undefined | null;
}

export const Image = ({ src, ...props }: IImageProps) => {
  const resolvedSrc = src && src !== "" ? src : DEFAULT_IMAGE_SRC;

  return <NextImage {...props} src={resolvedSrc} />;
};
