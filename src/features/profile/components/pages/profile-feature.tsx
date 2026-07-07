"use client";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { PostList } from "@/features/post";
import { updateAvatar, updateBanner } from "@/services/profile/update-profile-api";
import {
  FollowerProfileTabIcon,
  PencilChangeImageIcon,
  PictureProfileTabIcon,
  PostProfileTabIcon,
  ReactedProfileTabIcon,
  VideoProfileTabIcon,
} from "@/shared/components/atoms/icon/icon";
import { Image } from "@/shared/components/atoms/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useProfileImageUpload } from "@/shared/hooks/use-profile-image-upload";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import {
  combineIntoAvatarName,
  combineIntoDisplayName,
  getInitialsFromDisplayName,
} from "@/shared/utils/combine-name";
import { userProfileOptions } from "../../config/user-profile-options";
import { useAttachments } from "../../hooks/use-attachments";
import { useFollowers } from "../../hooks/use-followers";
import { useProfile } from "../../hooks/use-profile";
import { useRequestFollow, useUnfollow } from "../../hooks/use-profile-mutations";
import { useProfilePosts } from "../../hooks/use-profile-posts";
import { useTabNavigation } from "../../hooks/use-tab-navigation";
import type { ProfileType } from "../../types/profile";
import type { ProfileFollower } from "../../types/profile-tabs";

const MAX_PREVIEW_FRIENDS_AVATAR = 7;

const listTabs = [
  { label: "Bài đăng", icon: <PostProfileTabIcon /> },
  { label: "Hình ảnh", icon: <PictureProfileTabIcon /> },
  { label: "Video", icon: <VideoProfileTabIcon /> },
  { label: "Người theo dõi", icon: <FollowerProfileTabIcon /> },
  { label: "Đã tương tác", icon: <ReactedProfileTabIcon /> },
];

export default function Profile() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const { user } = ownerAccountStore();
  const [accountInfo, setAccountInfo] = useState<ProfileType | undefined>();

  const { showPopup, hidePopup } = usePopupStore();
  const { selectImageFile, uploadImage } = useProfileImageUpload();

  const isOwner = !userId || userId === user?.id;
  const {
    containerTabsRef,
    wrapperTabsRef,
    currentTab,
    setCurrentTab,
    clickChangeTab,
    onPressDown,
    onDrag,
    onEnd,
  } = useTabNavigation();
  const profilePostUserId = isOwner ? user?.id : userId;
  const { postsUser, fetchPostsUser, hasMorePosts } = useProfilePosts(
    profilePostUserId,
    currentTab,
  );
  const { followers } = useFollowers(currentTab);
  const { pictures } = useAttachments(user?.id);
  const { data: profileData } = useProfile(isOwner ? null : userId);
  const { mutate: mutateRequestFollow } = useRequestFollow();
  const { mutate: mutateUnfollow } = useUnfollow();

  // ─── handlers ─────────────────────────────────────────────────────────────

  const handleSelectBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(e);
    if (!selected) return;
    const { file, previewURL } = selected;
    showPopup(
      "Cập nhật ảnh bìa",
      <div className="p-4 text-center">
        <Image
          src={previewURL}
          alt="preview"
          width={0}
          height={0}
          sizes="100vw"
          className="max-h-64 w-auto mx-auto rounded"
        />
        <Button
          type="button"
          className="btn-primary mt-4 px-6"
          onClick={async () => {
            hidePopup();
            await uploadImage(file, previewURL, {
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
        >
          Xác nhận
        </Button>
      </div>,
    );
  };

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(e);
    if (!selected) return;
    const { file, previewURL } = selected;
    showPopup(
      "Cập nhật ảnh đại diện",
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
      </div>,
    );
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
          background: user.banner ?? "",
          avatar: user.avatar ?? "",
          displayName: user.displayName ?? "",
          followers: [],
          relationship: false,
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

  // ─── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex-grow bg-background transition overflow-auto scrollable-div">
      <div className="lg:max-w-[630px] mx-auto">
        {/* background */}
        <div
          className={cn(
            "relative sm:mt-5 mt-2 aspect-[3/1] overflow-hidden lg:rounded-lg border",
            !accountInfo?.background && "border-field",
          )}
        >
          {accountInfo?.background ? (
            <Image
              src={accountInfo.background}
              alt="Ảnh bìa"
              fill
              sizes="(max-width: 1024px) 100vw, 630px"
              className="object-cover object-center"
            />
          ) : (
            isOwner && (
              <div className="size-full grid place-content-center">
                <p>Cập nhật ảnh bìa của bạn</p>
              </div>
            )
          )}
          {isOwner && (
            <label
              htmlFor="profile-banner-upload"
              className="btn-secondary w-fit absolute bottom-2 right-2 py-1 ps-2.5 pe-4 border cursor-pointer"
            >
              <PencilChangeImageIcon />
              Đổi ảnh bìa
              <Input
                id="profile-banner-upload"
                type="file"
                hidden
                onChange={handleSelectBackground}
                onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                  (e.target as HTMLInputElement).value = "";
                }}
              />
            </label>
          )}
        </div>

        <div className="sm:-mt-6 -mt-4 mx-auto lg:max-w-[630px]">
          {/* profile detail */}
          <div className="flex sm:flex-row sm:items-start flex-col items-center gap-4 sm:px-3 px-1">
            {/* avatar */}
            <div className="relative bg-background border-4 rounded-full p-1 mt-3 w-fit transition">
              <Avatar className="size-[120px]">
                <AvatarImage src={accountInfo?.avatar} />
                <AvatarFallback className="text-[40px] transition">
                  {getInitialsFromDisplayName(accountInfo?.displayName ?? "")}
                </AvatarFallback>
              </Avatar>
              {isOwner && (
                <label
                  htmlFor="profile-avatar-upload"
                  className="btn-secondary w-fit absolute bottom-0 right-0 p-1 rounded-full shadow border cursor-pointer"
                >
                  <Input
                    id="profile-avatar-upload"
                    type="file"
                    hidden
                    onChange={handleSelectAvatar}
                    onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                      (e.target as HTMLInputElement).value = "";
                    }}
                  />
                  <PencilChangeImageIcon />
                </label>
              )}
            </div>

            <div className="flex-grow sm:self-center sm:block sm:px-0 sm:pt-5 px-4 flex flex-col items-center">
              <h3 className="line-clamp-2">{accountInfo?.displayName ?? ""}</h3>
              <p>{accountInfo?.followers?.length} người theo dõi</p>
              <div className="mt-1 flex -space-x-2">
                {accountInfo?.followers
                  ?.slice(0, MAX_PREVIEW_FRIENDS_AVATAR)
                  .map((friend: ProfileFollower, index: number) => (
                    <div key={friend.userId ?? friend.firstName} className="relative">
                      <Avatar className="size-7 ring-[2px] ring-background transition">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="text-[11px] font-medium">
                          {combineIntoAvatarName(friend.firstName, friend.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {index + 1 ===
                        Math.min(MAX_PREVIEW_FRIENDS_AVATAR, accountInfo?.followers?.length) && (
                        <Button
                          type="button"
                          className="absolute top-0 size-full bg-black/50 grid place-content-center rounded-full hover:bg-black/60"
                          onClick={() => clickChangeTab(3)}
                        >
                          <Ellipsis className="size-4 text-txtWhite" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="self-center flex gap-4">
              {/* profile options */}
              <Popover>
                <PopoverTrigger className="btn-secondary aspect-square h-10 border">
                  <Ellipsis className="size-5" />
                </PopoverTrigger>
                <PopoverContent className="bg-background p-1.5 w-64">
                  {userProfileOptions[isOwner ? "OWNER" : "OTHER"].map((item) => (
                    <Button
                      key={item.to}
                      asChild
                      variant="ghost"
                      className="btn-transparent gap-2 justify-start px-3 py-2.5"
                    >
                      <Link href={item.to}>
                        {item.icon} {item.content}
                      </Link>
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* follow / unfollow */}
              {!isOwner && accountInfo?.relationship === false && (
                <Button
                  type="button"
                  variant="ghost"
                  className="btn-primary px-8 text-nowrap h-10"
                  onClick={handleRequestFollow}
                >
                  Theo dõi
                </Button>
              )}
              {!isOwner && accountInfo?.relationship === true && (
                <Button
                  type="button"
                  variant="ghost"
                  className="btn-secondary px-5 text-nowrap h-10"
                  onClick={handleUnfollow}
                >
                  Đang theo dõi
                </Button>
              )}
            </div>
          </div>

          {/* bio */}
          <div className="mt-4 text-center">{accountInfo?.bio ?? ""}</div>

          <div className="mt-8 flex flex-col gap-2">
            {/* tab header */}
            <div className="border-t flex bg-background transition">
              {(isOwner ? listTabs : listTabs.slice(0, 4)).map((tab, index) => (
                <Button
                  type="button"
                  key={tab.label}
                  variant="outline"
                  className={`flex-grow flex items-center justify-center gap-1 px-1 sm:py-1 py-3 ${
                    currentTab === index
                      ? "text-primary-text fill-primary-text stroke-primary-text border-primary-text"
                      : "text-gray fill-gray stroke-gray border-background"
                  }`}
                  onClick={() => clickChangeTab(index)}
                >
                  {tab.icon}
                  <span className="sm:inline hidden">{tab.label}</span>
                </Button>
              ))}
            </div>

            {/* tab content scroll container */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-to-scroll container, not a clickable control */}
            <div
              ref={containerTabsRef}
              className="w-full overflow-x-auto snap-x snap-mandatory scrollable-div scroll-smooth"
              onMouseDown={onPressDown}
              onMouseMove={onDrag}
              onMouseUp={onEnd}
            >
              <div
                ref={wrapperTabsRef}
                className={cn(
                  "grid gap-[1px]",
                  isOwner ? "grid-cols-[repeat(5,100%)]" : "grid-cols-[repeat(4,100%)]",
                )}
              >
                {/* Tab 0: Posts */}
                <div className="pt-0.5 snap-start mx-auto md:pb-0 w-full">
                  <PostList
                    posts={postsUser}
                    fetchPosts={fetchPostsUser}
                    hasMore={hasMorePosts}
                    cardStyle
                  />
                </div>

                {/* Tab 1: Pictures */}
                <div className="snap-start grid grid-cols-3 gap-[1px] w-full">
                  {pictures.map((picture) => (
                    <div
                      key={picture.url}
                      className="relative aspect-square w-full overflow-hidden"
                    >
                      <Image
                        src={picture.url}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 33vw, 210px"
                        className="object-cover object-center"
                      />
                    </div>
                  ))}
                  <div className="col-span-3 text-center text-gray-light mt-32">
                    Tính năng đang phát triển
                  </div>
                </div>

                {/* Tab 2: Videos */}
                <div className="snap-start grid grid-cols-3 gap-[1px] w-full">
                  <div className="col-span-3 text-center text-gray-light mt-32">
                    Tính năng đang phát triển
                  </div>
                </div>

                {/* Tab 3: Followers */}
                <div className="snap-start grid grid-cols-5 sm:gap-3 gap-2 w-full">
                  {followers?.map((friend) => (
                    <div key={friend.userId ?? friend.firstName}>
                      <div className="aspect-square">
                        <Avatar className="size-full rounded-md">
                          <AvatarImage
                            src={friend.avatar}
                            alt={`${friend.firstName} ${friend.lastName}`}
                            className="rounded-none"
                          />
                          <AvatarFallback className="rounded-none text-[32px]">
                            {combineIntoAvatarName(friend.firstName, friend.lastName)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <p className="font-semibold">
                        {combineIntoDisplayName(friend.firstName, friend.lastName)}
                      </p>
                    </div>
                  ))}
                  {(!followers || followers.length === 0) && (
                    <p className="text-center col-span-5">Không có người theo dõi</p>
                  )}
                </div>

                {/* Tab 4: Posts reacted (owner only) */}
                {isOwner && (
                  <div className="pt-0.5 snap-start mx-auto md:pb-0 w-full">
                    <PostList posts={postsUser} hasMore={false} cardStyle />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
