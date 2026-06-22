"use client";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getPosts } from "@/shared/api/posts/posts-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { Button } from "@/shared/components/atoms/button";
import {
  FollowerProfileTabIcon,
  PencilChangeImageIcon,
  PictureProfileTabIcon,
  PostProfileTabIcon,
  ReactedProfileTabIcon,
  VideoProfileTabIcon,
} from "@/shared/components/atoms/icon/icon";
import { Input } from "@/shared/components/atoms/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/atoms/popover";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";
import {
  combineIntoAvatarName,
  combineIntoDisplayName,
  getInitialsFromDisplayName,
} from "@/shared/utils/combine-name";
import { getPictures } from "../../../api/attachments-api";
import { getFollowers, getProfile, requestFollow, unfollow } from "../../../api/profile-api";
import { updateAvatar, updateBanner } from "../../../api/update-profile-info-api";
import { userProfileOptions } from "../../../config/user-profile-options";
import type { AttachmentsResponse } from "../../../types/attachments";

export interface ProfileInfo {
  bio: string;
  background: string;
  avatar: string;
  displayName: string;
  followers: any[];
  relationship: boolean;
}

const listTabs = [
  { label: "Bài đăng", icon: <PostProfileTabIcon /> },
  { label: "Hình ảnh", icon: <PictureProfileTabIcon /> },
  { label: "Video", icon: <VideoProfileTabIcon /> },
  { label: "Người theo dõi", icon: <FollowerProfileTabIcon /> },
  { label: "Đã tương tác", icon: <ReactedProfileTabIcon /> },
];

export function ProfileFeature() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const { user, setUser } = ownerAccountStore();
  const [accountInfo, setAccountInfo] = useState<ProfileInfo | undefined>();
  const maxPreviewFriendsAvatar = useRef(7);
  const [pictures, setPictures] = useState<AttachmentsResponse[]>([]);

  const { showPopup, hidePopup } = usePopupStore();

  // Posts state (no store — local until postsStore is created)
  const [postsUser, setPostsUser] = useState<any[] | null>(null);
  const [isEndUserPosts, setIsEndUserPosts] = useState(false);

  // Followers state
  const [followers, setFollowers] = useState<any[] | null>(null);

  // Tabs
  const containerTabsRef = useRef<HTMLDivElement>(null);
  const wrapperTabsRef = useRef<HTMLDivElement>(null);
  const [currentTab, setCurrentTab] = useState<number | null>(null);
  const ignoreIntersec = useRef(false);

  // Drag-to-scroll state
  const [touched, setTouched] = useState(false);
  const startDragPos = useRef(0);
  const scrollLeftStart = useRef(0);
  const speedFactor = 2;

  const isOwner = !userId || userId === user?.userId;

  // ─── handlers ─────────────────────────────────────────────────────────────

  const handleSelectBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    showPopup(
      "Cập nhật ảnh bìa",
      <div className="p-4 text-center">
        <img src={previewURL} alt="preview" className="max-h-64 mx-auto rounded" />
        <Button
          type="button"
          className="btn-primary mt-4 px-6"
          onClick={async () => {
            setUser({ ...user!, background: previewURL } as any);
            hidePopup();
            try {
              const resp = (await updateBanner(file)) as any;
              if (resp?.statusCode === 200) {
                const serverURL = resp.data?.background ?? resp.data?.url ?? resp.data;
                if (serverURL) setUser({ ...user!, background: serverURL } as any);
                toast.success("Đã cập nhật ảnh bìa");
              } else {
                toast.error("Cập nhật ảnh bìa thất bại");
              }
            } catch {
              toast.error("Cập nhật ảnh bìa thất bại");
            }
          }}
        >
          Xác nhận
        </Button>
      </div>,
    );
  };

  const handleSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    showPopup(
      "Cập nhật ảnh đại diện",
      <div className="p-4 text-center">
        <img src={previewURL} alt="preview" className="size-32 rounded-full mx-auto object-cover" />
        <Button
          type="button"
          className="btn-primary mt-4 px-6"
          onClick={async () => {
            setUser({ ...user!, avatar: previewURL } as any);
            hidePopup();
            try {
              const resp = (await updateAvatar(file)) as any;
              if (resp) toast.success("Đã cập nhật ảnh đại diện");
            } catch {
              toast.error("Cập nhật ảnh đại diện thất bại");
            }
          }}
        >
          Xác nhận
        </Button>
      </div>,
    );
  };

  const handleRequestFollow = () => {
    requestFollow(userId!);
    setAccountInfo((prev) => (prev ? { ...prev, relationship: true } : prev));
  };

  const handleUnfollow = () => {
    unfollow(userId!);
    setAccountInfo((prev) => (prev ? { ...prev, relationship: false } : prev));
  };

  // ─── tab content fetchers ─────────────────────────────────────────────────

  const fetchPostsUser = async () => {
    if (!user?.userId) return;
    const resp = (await getPosts(user.userId, 0)) as any;
    if (!resp || resp.statusCode !== 200) return;
    if (!postsUser) {
      setPostsUser(resp.data);
    } else {
      if (postsUser.length !== 0 && resp.data.length === 0) {
        setIsEndUserPosts(true);
        return;
      }
      setPostsUser((prev) => [...(prev ?? []), ...resp.data]);
    }
  };

  const showFollowers = async () => {
    if (followers) return;
    const resp = (await getFollowers()) as any;
    if (!resp || resp.statusCode !== 200) return;
    setFollowers(resp.data);
  };

  useEffect(() => {
    switch (currentTab) {
      case 0:
        fetchPostsUser();
        break;
      case 3:
        showFollowers();
        break;
      default:
        break;
    }
  }, [currentTab, showFollowers, fetchPostsUser]);

  // ─── tab navigation ────────────────────────────────────────────────────────

  const clickChangeTab = (index: number) => {
    const container = containerTabsRef.current;
    const wrapper = wrapperTabsRef.current;
    if (!container || !wrapper) return;
    const targetChild = wrapper.children[index] as HTMLElement;
    if (!targetChild) return;
    const targetLeft = targetChild.offsetLeft - container.offsetLeft;
    container.scrollTo({ left: targetLeft, behavior: "smooth" });
    ignoreIntersec.current = true;
    setCurrentTab(index);
    setTimeout(() => {
      if (ignoreIntersec.current) ignoreIntersec.current = false;
    }, 500);
  };

  // drag-to-scroll
  const onPressDown = (e: React.MouseEvent | React.TouchEvent) => {
    setTouched(true);
    const clientX = "touches" in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    startDragPos.current = clientX ?? 0;
    scrollLeftStart.current = containerTabsRef.current?.scrollLeft ?? 0;
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!touched || !containerTabsRef.current) return;
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
    const diff = (clientX ?? 0) - startDragPos.current;
    containerTabsRef.current.scrollLeft = scrollLeftStart.current - diff * speedFactor;
  };

  const onEnd = () => setTouched(false);

  // ─── IntersectionObserver for auto-activating tab on scroll ───────────────

  useEffect(() => {
    const wrapper = wrapperTabsRef.current;
    if (!wrapper) return;
    const interCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !ignoreIntersec.current) {
          const index = Array.from(wrapper.children).indexOf(entry.target as HTMLElement);
          setCurrentTab(index);
        }
      });
    };
    const observer = new IntersectionObserver(interCallback, {
      root: containerTabsRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    });
    Array.from(wrapper.children).forEach((el) => {
      observer.observe(el as Element);
    });
    return () => observer.disconnect();
  }, []);

  // ─── initial data load ─────────────────────────────────────────────────────

  const handleGetProfile = async () => {
    if (!userId) return;
    const resp = (await getProfile(userId)) as any;
    if (!resp || resp.statusCode !== 200) return;
    setAccountInfo(resp.data);
  };

  const handleGetPictures = async () => {
    if (!user?.userId) return;
    const resp = (await getPictures({ postId: user.userId, type: "image" })) as any;
    if (!resp || resp.statusCode !== 200) return;
    setPictures(resp.data);
  };

  useEffect(() => {
    if (!user?.userId) return;
    setCurrentTab(0);
    if (isOwner) {
      console.log("user: ", user);
      setAccountInfo({
        ...user,
        followers: [],
        relationship: false,
        background: (user as any).background ?? "",
      } as unknown as ProfileInfo);
    } else {
      console.log("fetching: ", user);
      handleGetProfile();
    }
  }, [user?.userId, isOwner, (user as any).background, handleGetProfile, user]);

  useEffect(() => {
    handleGetPictures();
  }, [handleGetPictures]);

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
            <img
              src={accountInfo.background}
              alt="Ảnh bìa"
              className="object-cover size-full object-center"
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
                  ?.slice(0, maxPreviewFriendsAvatar.current)
                  .map((friend: any, index: number) => (
                    <div key={friend.userId ?? friend.firstName} className="relative">
                      <Avatar className="size-7 ring-[2px] ring-background transition">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="text-[11px] font-medium">
                          {combineIntoAvatarName(friend.firstName, friend.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      {index + 1 ===
                        Math.min(
                          maxPreviewFriendsAvatar.current,
                          accountInfo?.followers?.length,
                        ) && (
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
                  className={`flex-grow flex items-center justify-center gap-1 border-t px-1 sm:py-1 py-3 ${
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
                <div className="pt-0.5 snap-start mx-auto md:space-y-4 space-y-1.5 md:pb-0 w-full">
                  {postsUser?.map((post: any) => (
                    <div key={post.id} className="sm:rounded shadow-y border-x my-2 md:my-4 p-4">
                      <p>{post.content}</p>
                    </div>
                  ))}
                  {isEndUserPosts && (
                    <p className="pb-4 text-center text-gray">Bạn đã xem hết bài viết</p>
                  )}
                </div>

                {/* Tab 1: Pictures */}
                <div className="snap-start grid grid-cols-3 gap-[1px] w-full">
                  {pictures.map((picture) => (
                    <div key={picture.url} className="aspect-square w-full overflow-hidden">
                      <img src={picture.url} alt="" className="w-full object-cover object-center" />
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
                  {followers?.map((friend: any) => (
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
                  <div className="pt-0.5 snap-start mx-auto md:space-y-4 space-y-1.5 md:pb-0 w-full">
                    {postsUser?.map((post: any) => (
                      <div key={post.id} className="sm:rounded shadow-y border-x my-2 md:my-4 p-4">
                        <p>{post.content}</p>
                      </div>
                    ))}
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
