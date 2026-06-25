const PNG_CONVERTIBLE_IMAGE_TYPES = new Set([
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/bmp",
  "image/gif",
]);

const createImageElement = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể tải ảnh để convert sang PNG"));
    image.src = src;
  });
};

const fileNameToPng = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) {
    return `${fileName}.png`;
  }

  return `${fileName.slice(0, dotIndex)}.png`;
};

const blobToPngFile = (blob: Blob, fileName: string) => {
  return new File([blob], fileNameToPng(fileName), {
    type: "image/png",
    lastModified: Date.now(),
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement) => {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Không thể tạo blob PNG từ canvas"));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
};

export const canConvertImageToPng = (file: File) => {
  return PNG_CONVERTIBLE_IMAGE_TYPES.has(file.type.toLowerCase());
};

export const convertImageToPng = async (file: File) => {
  if (!canConvertImageToPng(file)) {
    return file;
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await createImageElement(objectUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0);
    const blob = await canvasToBlob(canvas);
    return blobToPngFile(blob, file.name);
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
