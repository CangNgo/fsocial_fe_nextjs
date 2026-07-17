"use client";

import { Button } from "@/shared/components/ui/button";
import { getCroppedImageFile } from "@/shared/utils/get-cropped-image";
import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

const BACKGROUND_ASPECT_RATIO = 2 / 1;

interface BackgroundCropperProps {
  imageSrc: string;
  fileName: string;
  fileType: string;
  onConfirm: (croppedFile: File) => void;
}

export function BackgroundCropper({
  imageSrc,
  fileName,
  fileType,
  onConfirm,
}: BackgroundCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const croppedFile = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName, fileType);
    onConfirm(croppedFile);
  };

  return (
    <div className="p-4 text-center w-125 max-w-full">
      <div className="relative w-full h-120 rounded overflow-hidden bg-black">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={BACKGROUND_ASPECT_RATIO}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      {/* <Slider
        className="mt-4"
        min={1}
        max={3}
        step={0.1}
        value={[zoom]}
        onValueChange={([value]) => setZoom(value)}
      /> */}
      <Button type="button" className="btn-primary mt-4 px-6" onClick={handleConfirm}>
        Xác nhận
      </Button>
    </div>
  );
}
