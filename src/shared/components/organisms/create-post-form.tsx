// @ts-nocheck
"use client";

import { X } from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { createPost } from "@/shared/api/posts/posts-api";
import {
  ArrowLeftIcon,
  LoadingIcon,
  PencilChangeImageIcon,
  UploadDecorIcon,
} from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { convertImageToPng } from "@/shared/utils/convert-image-to-png";

interface FilePreview {
  src: string;
  type: "image" | "video";
}

interface CreatePostFormProps {
  onPostCreated?: (post: any) => void;
}

const PREVIEW_HEIGHT = "50vh";

const getPreviewGridClassName = (count: number) => {
  switch (count) {
    case 1:
      return "grid-cols-1 grid-rows-1";
    case 2:
      return "grid-cols-2 grid-rows-1";
    case 3:
      return "grid-cols-2 grid-rows-2";
    case 4:
      return "grid-cols-2 grid-rows-2";
    default:
      return "grid-cols-6 grid-rows-2";
  }
};

const getPreviewCellClassName = (count: number, index: number) => {
  if (count === 1) return "col-span-1 row-span-1";
  if (count === 2) return "col-span-1 row-span-1";
  if (count === 3) return index === 0 ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
  if (count === 4) return "col-span-1 row-span-1";
  return index < 2 ? "col-span-3 row-span-1" : "col-span-2 row-span-1";
};

const getPreviewMediaClassName = (count: number) =>
  count === 1 ? "size-full object-contain" : "size-full object-cover";

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const hidePopup = usePopupStore((state) => state.hidePopup);
  const user = ownerAccountStore((state) => state.user);

  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [content, setContent] = useState("");

  const textboxRef = useRef<HTMLTextAreaElement>(null);

  const visiblePreviews = filePreviews.slice(0, 5);
  const hiddenPreviewCount = Math.max(0, filePreviews.length - 5);
  const previewCount = visiblePreviews.length;

  const scrollToItem = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const closePopup = () => {
    hidePopup();
    setContent("");
    setFileUploads([]);
    setFilePreviews([]);
  };

  const handleOnFileChange = async (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } },
  ) => {
    const files = e.target.files;
    if (!files) return;

    const normalizedFiles = await Promise.all(Array.from(files).map((file) => convertImageToPng(file)));

    const previewUrls: FilePreview[] = normalizedFiles.map((file) => ({
      src: URL.createObjectURL(file),
      type: file.type.split("/")[0] as "image" | "video",
    }));

    setFileUploads((prev) => [...prev, ...normalizedFiles]);
    setFilePreviews((prev) => [...prev, ...previewUrls]);
    scrollToItem(0);
  };

  const handleFileInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).value = "";
  };

  const handleSubmitPost = async () => {
    setSubmitClicked(true);

    const formData = new FormData();
    if (user) {
      formData.append("userId", user.userId);
    }
    formData.append("text", content);
    formData.append("HTMLText", content);
    fileUploads.forEach((file) => {
      formData.append("media", file);
    });

    const resp = (await createPost(formData)) as any;
    if (!resp || ![100, 200, 201].includes(resp.statusCode)) {
      toast.error(resp?.message ?? "Đã có lỗi xảy ra khi cố gắng đăng tải bài viết của bạn");
      setSubmitClicked(false);
      return;
    }

    const postCreated = {
      ...resp.data,
      displayName: user?.displayName,
      avatar: user?.avatar,
    };

    onPostCreated?.(postCreated);
    toast.success("Bài viết của bạn đã được đăng tải");
    closePopup();
    setSubmitClicked(false);
  };

  const deleteFile = (index: number) => {
    setFileUploads((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-screen h-fit sm:w-[540px]">
      <Carousel setApi={setCarouselApi}>
        <CarouselContent>
          <CarouselItem>
            <div className="relative h-[100dvh] overflow-y-auto scrollable-div space-y-2 pt-11 sm:h-full sm:max-h-[80dvh]">
              <div className="flex items-start justify-between px-4 pt-3">
                <div className="flex items-center gap-2">
                  <Avatar className="grid size-9">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="text-[12px]">{user?.displayName ?? ""}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center">
                    <span className="font-semibold">{user?.displayName ?? ""}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  className={cn("btn-primary w-fit", submitClicked && "disable-btn")}
                  onClick={handleSubmitPost}
                  disabled={submitClicked}
                >
                  {submitClicked ? <LoadingIcon /> : "Đăng bài"}
                </Button>
              </div>

              <div className="px-4">
                <Textarea
                  ref={textboxRef}
                  autoFocus
                  placeholder="Hãy chia sẽ khoảnh khắc của bạn..."
                  className="min-h-24 resize-none border-0 shadow-none focus-visible:ring-0"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="relative">
                {previewCount > 0 && (
                  <div className="overflow-hidden rounded-md" style={{ height: PREVIEW_HEIGHT }}>
                    <div
                      className={cn("grid h-full w-full gap-1", getPreviewGridClassName(previewCount))}
                    >
                      {visiblePreviews.map((preview, index) => {
                        const showOverlay = hiddenPreviewCount > 0 && index === 4;
                        return (
                          <div
                            key={preview.src}
                            className={cn(
                              "relative overflow-hidden rounded-md bg-muted",
                              getPreviewCellClassName(previewCount, index),
                            )}
                          >
                            {preview.type === "image" && (
                              <img
                                src={preview.src}
                                alt="Bài đăng"
                                className={getPreviewMediaClassName(previewCount)}
                              />
                            )}
                            {preview.type === "video" && (
                              <video
                                src={preview.src}
                                controls
                                className={getPreviewMediaClassName(previewCount)}
                              />
                            )}
                            {showOverlay && (
                              <div className="absolute inset-0 grid place-content-center bg-black/60 text-white">
                                <span className="text-2xl font-semibold">+{hiddenPreviewCount}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <label
                  htmlFor="create-post-file-upload"
                  className={cn(
                    "rounded-md flex items-center justify-center bg-gray-3light",
                    fileUploads.length === 0 ? "mx-3 cursor-pointer aspect-video" : "opacity-0 absolute inset-0",
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "var(--gray-2light-clr)";
                    e.currentTarget.style.opacity = fileUploads.length === 0 ? "0.2" : "0.7";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.opacity = "";
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.opacity = "";
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      await handleOnFileChange({ target: { files } } as { target: { files: FileList } });
                    }
                  }}
                >
                  <div className="flex flex-col items-center pointer-events-none">
                    <UploadDecorIcon className="size-24 text-gray-clr" />
                    <span>Chọn hoặc kéo thả ảnh/video vào đây</span>
                  </div>
                  <Input
                    type="file"
                    id="create-post-file-upload"
                    onChange={handleOnFileChange}
                    onClick={handleFileInputClick}
                    hidden
                    multiple
                  />
                </label>

                {previewCount > 0 && (
                  <Button
                    type="button"
                    className="btn-secondary absolute left-2 top-2 z-10 h-fit w-fit border px-3 py-1 shadow-md"
                    onClick={() => scrollToItem(1)}
                  >
                    <PencilChangeImageIcon /> Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 bg-background p-3">
              {filePreviews.length > 0 && (
                <Button
                  type="button"
                  onClick={() => document.getElementById("create-post-file-upload")?.click()}
                  className="btn-secondary py-2.5"
                >
                  Thêm ảnh/video
                </Button>
              )}
            </div>
          </CarouselItem>

          {/* {filePreviews.length > 0 && (
            <CarouselItem>
              <div className="relative flex h-[100dvh] flex-col pt-11 sm:h-full sm:max-h-[90dvh]">
                <div className="flex-grow overflow-y-auto scrollable-div space-y-2">
                  {filePreviews.map((media, index) => (
                    <div key={media.src} className="relative overflow-hidden">
                      {media.type === "image" && (
                        <img src={media.src} alt="Bài đăng" className="size-full object-cover object-center" />
                      )}
                      {media.type === "video" && (
                        <video src={media.src} controls className="size-full object-cover object-center" />
                      )}
                      <Button
                        type="button"
                        className="btn-secondary absolute right-2 top-2 w-fit aspect-square p-1"
                        onClick={() => deleteFile(index)}
                      >
                        <X />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="absolute top-0 grid p-3 pt-14">
                  <Button
                    type="button"
                    onClick={() => scrollToItem(0)}
                    className="btn-secondary box-border w-fit border py-1 ps-2 pe-4 shadow-xl"
                  >
                    <ArrowLeftIcon /> Quay lại
                  </Button>
                </div>

                <div className="absolute bottom-0 w-full p-3">
                  <Button
                    type="button"
                    onClick={() => document.getElementById("create-post-file-upload")?.click()}
                    className="btn-secondary w-full border py-2.5 shadow-xl"
                  >
                    Thêm ảnh/video
                  </Button>
                </div>
              </div>
            </CarouselItem>
          )} */}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
