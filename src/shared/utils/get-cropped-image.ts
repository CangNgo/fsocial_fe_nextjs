import type { Area } from "react-easy-crop";

const createImageElement = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể tải ảnh để cắt"));
    image.src = src;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể tạo blob từ vùng cắt"));
        return;
      }
      resolve(blob);
    }, type);
  });
};

export async function getCroppedImageFile(
  imageSrc: string,
  croppedAreaPixels: Area,
  fileName: string,
  fileType: string,
): Promise<File> {
  const image = await createImageElement(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Không thể tạo context canvas");
  }

  context.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const type = fileType || "image/png";
  const blob = await canvasToBlob(canvas, type);
  return new File([blob], fileName, { type, lastModified: Date.now() });
}
