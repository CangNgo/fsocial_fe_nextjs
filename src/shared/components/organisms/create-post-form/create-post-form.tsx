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
import { TextBox } from "@/shared/components/atoms/jumping-input/jumping-input";
import type { ProcessedMedia } from "@/shared/components/molecules/media-grid/media-grid";
import { MediaGrid } from "@/shared/components/molecules/media-grid/media-grid";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";

interface FilePreview {
  src: string;
  type: "image" | "video";
}

interface CreatePostFormProps {
  /** Called with the newly created post data so callers can prepend it to a list */
  onPostCreated?: (post: any) => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const hidePopup = usePopupStore((state) => state.hidePopup);
  const user = ownerAccountStore((state) => state.user);

  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const textboxRef = useRef<HTMLDivElement>(null);

  const scrollToItem = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  const closePopup = () => {
    hidePopup();
    if (textboxRef.current) textboxRef.current.innerHTML = "";
    setFileUploads([]);
    setFilePreviews([]);
  };

  const handleOnFileChange = (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } },
  ) => {
    const files = e.target.files;
    if (!files) return;

    const previewUrls: FilePreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.split("/")[0] as "image" | "video";
      previewUrls.push({ src: URL.createObjectURL(file), type });
    }

    setFileUploads((prev) => [...prev, ...Array.from(files)]);
    setFilePreviews((prev) => [...prev, ...previewUrls]);
    scrollToItem(0);
  };

  const deleteFile = (index: number) => {
    setFileUploads((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPost = async () => {
    setSubmitClicked(true);

    const formData = new FormData();
    if (user) {
      formData.append("userId", user.userId);
    }
    formData.append("text", textboxRef.current?.innerText ?? "");
    formData.append("HTMLText", textboxRef.current?.innerHTML ?? "");
    fileUploads.forEach((file) => {
      formData.append("media", file);
    });

    const resp = (await createPost(formData)) as any;
    if (!resp || ![100, 200, 201].includes(resp.statusCode)) {
      toast.error("Đã có lỗi xảy ra khi cố gắng đăng tải bài viết của bạn");
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

  const filePreviewsAsMedia: ProcessedMedia[] = filePreviews.map((p) => ({
    src: p.src,
    type: p.type,
  }));

  console.log("user: ", user);

  return (
    <div className="sm:w-[540px] w-screen h-fit">
      <Carousel setApi={setCarouselApi}>
        <CarouselContent>
          {/* Slide 1: compose post */}
          <CarouselItem>
            <div className="relative pt-11 sm:max-h-[80dvh] sm:h-full h-[100dvh] overflow-y-auto scrollable-div space-y-2">
              <div className="flex space-x-2 px-4 pt-3">
                <Avatar className="size-9 grid">
                  <AvatarImage src={user?.avatar ?? undefined} />
                  <AvatarFallback className="text-[12px]">{user?.displayName ?? ""}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center">
                  <span className="font-semibold">{user?.displayName ?? ""}</span>
                </div>
              </div>

              <TextBox
                texboxRef={textboxRef}
                autoFocus
                placeholder="Nói gì đó về bài viết của bạn"
                className="px-4"
              />

              <div className="relative">
                {filePreviews.length > 0 && <MediaGrid medias={filePreviewsAsMedia} />}

                <label
                  htmlFor="create-post-file-upload"
                  className={cn(
                    "rounded-md flex items-center justify-center bg-gray-3light",
                    fileUploads.length === 0
                      ? "mx-3 cursor-pointer aspect-video"
                      : "opacity-0 absolute inset-0",
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
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.opacity = "";
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleOnFileChange({ target: { files } } as any);
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
                    hidden
                    multiple
                  />
                </label>

                {filePreviews.length > 0 && (
                  <Button
                    type="button"
                    className="btn-secondary h-fit w-fit px-3 py-1 absolute top-2 left-2 z-10 shadow-md border"
                    onClick={() => scrollToItem(1)}
                  >
                    <PencilChangeImageIcon /> Chỉnh sửa
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-background sticky bottom-0 flex gap-3 p-3">
              {filePreviews.length > 0 && (
                <Button
                  type="button"
                  onClick={() => {
                    document.getElementById("create-post-file-upload")?.click();
                  }}
                  className="btn-secondary py-2.5"
                >
                  Thêm ảnh/video
                </Button>
              )}
              <Button
                type="button"
                className={cn("btn-primary py-2.5", submitClicked && "disable-btn")}
                onClick={handleSubmitPost}
                disabled={submitClicked}
              >
                {submitClicked ? <LoadingIcon /> : "Đăng bài"}
              </Button>
            </div>
          </CarouselItem>

          {/* Slide 2: edit media */}
          {filePreviews.length > 0 && (
            <CarouselItem>
              <div className="relative flex flex-col pt-11 sm:max-h-[90dvh] sm:h-full h-[100dvh]">
                <div className="overflow-y-auto flex-grow scrollable-div space-y-2">
                  {filePreviews.map((media, index) => (
                    <div key={media.src} className="relative overflow-hidden">
                      {media.type === "image" && (
                        <img
                          src={media.src}
                          alt="Bài đăng"
                          className="size-full object-cover object-center"
                        />
                      )}
                      {media.type === "video" && (
                        // biome-ignore lint/a11y/useMediaCaption: user-uploaded media has no caption track available
                        <video
                          src={media.src}
                          controls
                          className="size-full object-cover object-center"
                        />
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

                <div className="absolute top-0 grid pt-14 p-3">
                  <Button
                    type="button"
                    onClick={() => scrollToItem(0)}
                    className="btn-secondary w-fit box-border shadow-xl border py-1 ps-2 pe-4"
                  >
                    <ArrowLeftIcon /> Quay lại
                  </Button>
                </div>

                <div className="absolute w-full bottom-0 grid p-3">
                  <Button
                    type="button"
                    onClick={() => {
                      document.getElementById("create-post-file-upload")?.click();
                    }}
                    className="btn-secondary w-full box-border shadow-xl border py-2.5"
                  >
                    Thêm ảnh/video
                  </Button>
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
