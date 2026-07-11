"use client";

import { createPost } from "@/services/posts/posts-api";
import {
  ArrowLeftIcon,
  LoadingIcon,
  PencilChangeImageIcon,
  UploadDecorIcon,
} from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { UserAvatar } from "@/shared/components/molecules/user-avatar";
import { PhotoGrid } from "@/shared/components/organisms/photo-grid";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/shared/components/ui/carousel";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { createPostFormData } from "@/shared/hooks/post-form";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { MediaLayoutType, MediaResponse, MediaType } from "@/shared/types/post";
import { convertImageToPng } from "@/shared/utils/convert-image-to-png";
import { X } from "lucide-react";
import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Đo kích thước thật của file local để PhotoGrid tính layout được
// (API tính sẵn ratio/layoutType, nhưng file chưa upload thì phải tự đo)
const measureMedia = (file: File, url: string): Promise<MediaResponse> =>
  new Promise((resolve) => {
    const type = file.type.startsWith("video") ? MediaType.VIDEO : MediaType.IMAGE;
    const done = (width: number, height: number) => {
      const ratio = width > 0 && height > 0 ? width / height : 1;
      const layoutType =
        ratio >= 2
          ? MediaLayoutType.PANORAMA
          : ratio > 1.05
            ? MediaLayoutType.LANDSCAPE
            : ratio < 0.95
              ? MediaLayoutType.PORTRAIT
              : MediaLayoutType.SQUARE;
      resolve({ url, type, width, height, ratio, layoutType });
    };
    if (type === MediaType.VIDEO) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => done(video.videoWidth, video.videoHeight);
      video.onerror = () => done(1, 1);
      video.src = url;
    } else {
      const img = new window.Image();
      img.onload = () => done(img.naturalWidth, img.naturalHeight);
      img.onerror = () => done(1, 1);
      img.src = url;
    }
  });

interface CreatePostFormProps {
}

export default function CreatePostForm({ }: CreatePostFormProps) {
  const hidePopup = usePopupStore((state) => state.hidePopup);
  const user = ownerAccountStore((state) => state.user);

  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<MediaResponse[]>([]);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [content, setContent] = useState("");

  const textboxRef = useRef<HTMLTextAreaElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [wrapperHeight, setWrapperHeight] = useState<number>();
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const previewCount = filePreviews.length;

  const scrollToItem = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  // Đồng bộ activeIndex mỗi khi embla đổi slide (do bấm nút "Chỉnh sửa" / "Quay lại")
  useLayoutEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => setActiveIndex(carouselApi.selectedScrollSnap());
    handleSelect();

    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  // Đo chiều cao thật của slide đang active, và theo dõi thay đổi nội dung bên trong nó
  // (vd: thêm ảnh ở tab 1 làm nó cao hơn) để cập nhật wrapperHeight tương ứng
  useLayoutEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (!activeEl) return;

    const updateHeight = () => setWrapperHeight(activeEl.offsetHeight);
    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(activeEl);

    return () => resizeObserver.disconnect();
    // filePreviews.length: khi tab 2 mount/unmount hoặc đổi số ảnh, node có thể thay đổi -> đo lại
  }, [activeIndex, filePreviews.length]);

  const closePopup = () => {
    hidePopup();
  };

  const handleOnFileChange = async (
    e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList } },
  ) => {
    const files = e.target.files;
    if (!files) return;

    const normalizedFiles = await Promise.all(
      Array.from(files).map((file) => convertImageToPng(file)),
    );

    const previewUrls = await Promise.all(
      normalizedFiles.map((file) => measureMedia(file, URL.createObjectURL(file))),
    );

    setFileUploads((prev) => [...prev, ...normalizedFiles]);
    setFilePreviews((prev) => [...prev, ...previewUrls]);
    scrollToItem(0);
  };

  const handleFileInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).value = "";
  };

  const handleSubmitPost = async () => {
    setSubmitClicked(true);
    const resp = await createPost(createPostFormData({
      userId: user?.id ?? "",
      text: content,
      htmltext: content,
      media: fileUploads,
    }))
    if (resp?.statusCode == 201) {
      toast.success("Đăng bài thành công");
      closePopup();
    } else {
      toast.error("Đăng bài thất bại");
    }

    setSubmitClicked(false);
  };

  const deleteFile = (index: number) => {
    setFileUploads((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-screen h-fit sm:w-[80dvh]">
      <div
        style={{
          height: wrapperHeight,
          transition: "height 300ms ease",
          overflow: "hidden",
        }}
      >
        <Carousel setApi={setCarouselApi}>
          <CarouselContent className="items-start">
            <CarouselItem>
              <div
                ref={(el) => {
                  itemRefs.current[0] = el;
                }}
                className="relative overflow-y-auto scrollable-div space-y-2 pt-11 sm:h-full sm:max-h-[90dvh]"
              >
                <div className="flex items-start justify-between px-4 pt-3">
                  <div className="flex items-center gap-2">
                    <UserAvatar
                      src={user?.avatar}
                      displayName={user?.displayName}
                      className="size-9"
                      fallbackClassName="text-[12px]"
                    />
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
                    className="min-h-10 resize-none border-0 shadow-none focus-visible:ring-0"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>

                <div className="relative">
                  {previewCount > 0 && (
                    <div className="max-h-[70vh] overflow-hidden">
                      <PhotoGrid media={filePreviews} rounded={8} className=" " />
                    </div>
                  )}

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
                    onDrop={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.opacity = "";
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        await handleOnFileChange({ target: { files } } as {
                          target: { files: FileList };
                        });
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
                <div className="flex justify-between items-center p-4 h-10">
                  <span>Thêm vào bài viết của bạn</span>
                  <div></div>
                </div>
              </div>
            </CarouselItem>

            {filePreviews.length > 0 && (
              <CarouselItem>
                <div
                  ref={(el) => {
                    itemRefs.current[1] = el;
                  }}
                  className="relative flex-col pt-11 sm:h-full sm:max-h-[90dvh]"
                >
                  <div className="flex-grow overflow-y-auto scrollable-div space-y-2">
                    {filePreviews.map((media, index) => (
                      <div key={media.url} className="relative overflow-hidden">
                        <Image
                          src={media.url}
                          type={media.type}
                          alt="Bài đăng"
                          width={0}
                          height={0}
                          sizes="90vw"
                          className="size-full object-cover object-center"
                        />
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
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
}
