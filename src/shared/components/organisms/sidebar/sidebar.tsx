"use client";
import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/atoms/avatar";
import { Button } from "@/shared/components/atoms/button";
import {
  Bell,
  CreatePostNavIcon,
  FollowNavIcon,
  HamburgerIcon,
  HomeNavIcon,
  LogoNoBG,
  MessageNavIcon,
} from "@/shared/components/atoms/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/atoms/popover";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { popupNotificationtStore, usePopupStore } from "@/shared/stores/popup-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

const NavMoreMenu = dynamic(
  () => import("@/shared/components/organisms/nav-more-menu").then((m) => m.NavMoreMenu),
  { ssr: false },
);
const CreatePostForm = dynamic(
  () =>
    import("@/shared/components/organisms/create-post-form")
      .then((m) => m.CreatePostForm)
      .catch(() => () => null),
  { ssr: false },
);

// sm-md (72px): icon centered, no gap/padding for text
// lg+  (260px): icon + text, left-aligned with gap
const ITEM = [
  "flex items-center w-full rounded-xl transition-colors duration-150",
  "hover:bg-accent active:bg-accent/80 cursor-pointer select-none",
  "sm:justify-center sm:px-0 sm:py-3",
  "lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5",
].join(" ");

const LABEL = "hidden lg:block text-sm font-medium";

function IconSlot({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex-shrink-0 w-[26px] h-[26px] flex items-center justify-center">
      {children}
    </span>
  );
}

function Dot() {
  return (
    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-gradient-to-br from-pink-500 to-orange-400" />
  );
}

export function Sidebar() {
  const user = ownerAccountStore((state) => state.user);
  const pathname = usePathname();

  const isInHome = pathname === "/" || pathname === "/home";
  const isInFollow = pathname === "/follow";
  const isInSearch = pathname === "/search";
  const isInMsg = pathname.startsWith("/message");
  const isInProfile = pathname === "/profile";

  const { isVisible: notiOpen, setIsVisible: setNotiOpen } = popupNotificationtStore();
  const closeNoti = () => setNotiOpen(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const { showPopup } = usePopupStore();
  const newMessage = useMessageStore((s) => s.newMessage);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <>
      {/* ────── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <nav
        className={cn(
          "hidden sm:flex flex-col justify-between",
          "sticky top-0 h-screen flex-shrink-0",
          "bg-background border-r overflow-y-auto overflow-x-hidden",
          "w-[72px] lg:w-[260px]",
          "transition-[width] duration-200 ease-in-out",
        )}
      >
        {/* Top section */}
        <div className="flex flex-col gap-0.5 pt-4 px-2">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start lg:pl-1 mb-3 py-1">
            <Link href="/" onClick={closeNoti}>
              <LogoNoBG className="h-8" />
            </Link>
          </div>

          {/* Home */}
          <Link href="/home" className={cn(ITEM, isInHome && "bg-accent")} onClick={closeNoti}>
            <IconSlot>
              <HomeNavIcon compareVar={isInHome} />
            </IconSlot>
            <span className={cn(LABEL, isInHome && "font-semibold")}>Trang chủ</span>
          </Link>

          {/* Follow */}
          <Link href="/follow" className={cn(ITEM, isInFollow && "bg-accent")} onClick={closeNoti}>
            <IconSlot>
              <FollowNavIcon compareVar={isInFollow} />
            </IconSlot>
            <span className={cn(LABEL, isInFollow && "font-semibold")}>Theo dõi</span>
          </Link>

          {/* Search */}
          <Link href="/search" className={cn(ITEM, isInSearch && "bg-accent")} onClick={closeNoti}>
            <IconSlot>
              <SearchIcon className="size-[26px]" strokeWidth={isInSearch ? 2.2 : 1.6} />
            </IconSlot>
            <span className={cn(LABEL, isInSearch && "font-semibold")}>Tìm kiếm</span>
          </Link>

          {/* Message */}
          <Link href="/message" className={cn(ITEM, isInMsg && "bg-accent")} onClick={closeNoti}>
            <IconSlot>
              <span className="relative">
                <MessageNavIcon compareVar={isInMsg} />
                {newMessage && <Dot />}
              </span>
            </IconSlot>
            <span className={cn(LABEL, isInMsg && "font-semibold")}>Tin nhắn</span>
          </Link>

          {/* Notification */}
          <Link
            href="/notifications"
            className={cn(ITEM, notiOpen && "bg-accent")}
            onClick={() => setNotiOpen(!notiOpen)}
          >
            <IconSlot>
              <span className="relative">
                <Bell active={notiOpen} />
                {unreadCount > 0 && <Dot />}
              </span>
            </IconSlot>
            <span className={LABEL}>Thông báo</span>
          </Link>

          {/* Create post */}
          <Link
            href=""
            className={ITEM}
            onClick={() => showPopup("Tạo bài viết", <CreatePostForm />)}
          >
            <IconSlot>
              <CreatePostNavIcon />
            </IconSlot>
            <span className={LABEL}>Tạo bài viết</span>
          </Link>

          {/* Profile */}
          <Link
            href="/profile"
            className={cn(ITEM, isInProfile && "bg-accent")}
            onClick={closeNoti}
          >
            <IconSlot>
              <Avatar className="size-[26px]">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-[8px] font-semibold">
                  {getInitialsFromDisplayName(user?.displayName ?? "")}
                </AvatarFallback>
              </Avatar>
            </IconSlot>
            <span className={cn(LABEL, isInProfile && "font-semibold")}>
              {user?.displayName ?? ""}
            </span>
          </Link>
        </div>

        {/* Bottom: More */}
        <div className="px-2 pb-4">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Link href="" className={cn(ITEM, menuOpen && "bg-accent")} onClick={closeNoti}>
                <IconSlot>
                  <HamburgerIcon />
                </IconSlot>
                <span className={LABEL}>Thêm</span>
              </Link>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="end"
              sideOffset={12}
              className="bg-background w-72 border shadow-xl p-2"
            >
              <NavMoreMenu setPopoverOpen={setMenuOpen} />
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      {/* ────── MOBILE BOTTOM BAR ────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-background border-t h-14 flex items-center">
        {[
          { href: "/home", icon: <HomeNavIcon compareVar={isInHome} /> },
          { href: "/follow", icon: <FollowNavIcon compareVar={isInFollow} /> },
          {
            href: "/search",
            icon: <SearchIcon className="size-[26px]" strokeWidth={isInSearch ? 2.2 : 1.6} />,
          },
          { href: "/message", icon: <MessageNavIcon compareVar={isInMsg} /> },
        ].map(({ href, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex items-center justify-center h-full"
            onClick={closeNoti}
          >
            {icon}
          </Link>
        ))}
        <Button
          type="button"
          className="flex-1 flex items-center justify-center h-full relative"
          onClick={() => setNotiOpen(!notiOpen)}
        >
          <Bell active={notiOpen} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-3 size-2.5 rounded-full bg-gradient-to-br from-pink-500 to-orange-400" />
          )}
        </Button>
      </nav>

      {/* Spacer for mobile so content isn't under bottom bar */}
      <div className="sm:hidden h-14" aria-hidden />
    </>
  );
}
