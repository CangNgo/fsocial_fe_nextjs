"use client";
import { updateAvatar, updateBanner } from "@/services/profile/update-profile-api";
import { Image } from "@/shared/components/atoms/image";
import { Button } from "@/shared/components/ui/button";
import type { CarouselApi } from "@/shared/components/ui/carousel";
import { useProfileImageUpload } from "@/shared/hooks/use-profile-image-upload";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import { AccountResponse } from "@/shared/types/profile";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useAttachments } from "../../hooks/use-attachments";
import { useProfile } from "../../hooks/use-profile";
import { useRequestFollow, useUnfollow } from "../../hooks/use-profile-mutations";
import { useProfilePosts } from "../../hooks/use-profile-posts";
import type { ProfileType } from "../../types/profile";
import { BackgroundCropper } from "../organisms/background-cropper";
import { ProfileCover } from "../organisms/profile-cover";
import { ProfileHeader } from "../organisms/profile-header";
import { ProfileTabs } from "../organisms/profile-tabs";

export default function Profile() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const { user } = ownerAccountStore();
  const [accountInfo, setAccountInfo] = useState<AccountResponse | undefined>();

  const { showPopup, hidePopup } = usePopupStore();
  const { selectImageFile, uploadImage } = useProfileImageUpload();

  const isOwner = userId !== user?.id;
  const [currentTab, setCurrentTab] = useState<number | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  const clickChangeTab = (index: number) => carouselApi?.scrollTo(index);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentTab(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const profilePostUserId = isOwner ? user?.id : userId;
  const { postsUser, fetchPostsUser, hasMorePosts } = useProfilePosts(
    profilePostUserId,
    currentTab,
  );

  const { pictures } = useAttachments(user?.id);
  const { data: profileData } = useProfile(isOwner ? null : userId);
  const { mutate: mutateRequestFollow } = useRequestFollow();
  const { mutate: mutateUnfollow } = useUnfollow();

  // ─── handlers ─────────────────────────────────────────────────────────────

  const handleSelectBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(e);
    if (!selected) return;
    const { file, previewURL } = selected;
    showPopup("Cập nhật ảnh bìa", () => (
      <BackgroundCropper
        imageSrc={previewURL}
        fileName={file.name}
        fileType={file.type}
        onConfirm={async (croppedFile) => {
          hidePopup();
          const croppedPreviewURL = URL.createObjectURL(croppedFile);
          await uploadImage(croppedFile, croppedPreviewURL, {
            uploadFn: updateBanner,
            optimisticField: "background",
            successMessage: "Đã cập nhật ảnh bìa",
            errorMessage: "Cập nhật ảnh bìa thất bại",
            resolveServerUrl: (resp) => {
              const data = (resp as { data?: { background?: string; url?: string } })?.data;
              return data?.background ?? data?.url ?? (data as unknown as string | undefined);
            },
          });
        }}
      />
    ));
  };

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(e);
    if (!selected) return;
    const { file, previewURL } = selected;
    showPopup("Cập nhật ảnh đại diện", () => (
      <div className="p-4 text-center">
        <Image
          src={previewURL}
          alt="preview"
          width={128}
          height={128}
          className="size-32 rounded-full mx-auto object-cover"
        />
        <Button
          type="button"
          className="btn-primary mt-4 px-6"
          onClick={async () => {
            hidePopup();
            await uploadImage(file, previewURL, {
              uploadFn: updateAvatar,
              optimisticField: "avatar",
              successMessage: "Đã cập nhật ảnh đại diện",
              errorMessage: "Cập nhật ảnh đại diện thất bại",
            });
          }}
        >
          Xác nhận
        </Button>
      </div>
    ));
  };

  const handleRequestFollow = () => {
    if (!userId) return;
    mutateRequestFollow(userId);
    setAccountInfo((prev) => (prev ? { ...prev, relationship: true } : prev));
  };

  const handleUnfollow = () => {
    if (!userId) return;
    mutateUnfollow(userId);
    setAccountInfo((prev) => (prev ? { ...prev, relationship: false } : prev));
  };

  // ─── initial data load ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;
    setCurrentTab(0);
    if (isOwner) {
      queueMicrotask(() => {
        setAccountInfo({
          bio: user.bio ?? "",
          background: user.background ?? "",
          avatar: user.avatar ?? "",
          displayName: user.displayName ?? "",
          follower: user.follower,
        });
      });
    }
  }, [user, isOwner, setCurrentTab]);

  useEffect(() => {
    if (isOwner) return;
    const data = profileData?.data;
    if (profileData?.statusCode !== 200 || !data) return;
    queueMicrotask(() => {
      setAccountInfo(data as unknown as ProfileType);
    });
  }, [isOwner, profileData]);

  return (
    <div className="flex-grow bg-background transition overflow-auto scrollable-div">
      <div className="lg:max-w-200 mx-auto">
        <ProfileCover
          background={accountInfo?.background}
          isOwner={isOwner}
          onSelectBackground={handleSelectBackground}
        />

        <div className="sm:-mt-6 -mt-4 mx-auto lg:max-w-200">
          <ProfileHeader
            userId={userId}
            avatar={user?.avatar}
            displayName={accountInfo?.displayName}
            followers={accountInfo?.follower}
            isOwner={isOwner}
            isFollowing={accountInfo?.follower?.find((item) => user.id === item) ? true : false}
            onSelectAvatar={handleSelectAvatar}
            onViewFollowers={() => clickChangeTab(3)}
            onRequestFollow={handleRequestFollow}
            onUnfollow={handleUnfollow}
          />

          {/* bio */}
          <div className="mt-4 text-center">{accountInfo?.bio ?? ""}</div>

          <ProfileTabs
            isOwner={isOwner}
            currentTab={currentTab}
            onTabClick={clickChangeTab}
            setCarouselApi={setCarouselApi}
            postsUser={postsUser}
            fetchPostsUser={fetchPostsUser}
            hasMorePosts={hasMorePosts}
            pictures={pictures}
          // followers={followers}
          />
        </div>
      </div>
    </div>
  );
}
