"use client";
import { SearchIcon } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CreatePostNavIcon,
  FollowNavIcon,
  HamburgerIcon,
  HomeNavIcon,
  LogoNoBG,
  MessageNavIcon,
} from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { useMessageStore } from "@/shared/stores/message-store";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { popupNotificationtStore, usePopupStore } from "@/shared/stores/popup-store";
import { getInitialsFromDisplayName } from "@/shared/utils/combine-name";

const NavMoreMenu = dynamic(
  () =>
    import("@/shared/components/organisms/nav-more-menu").then((m) => m.NavMoreMenu),
  { ssr: false },
);
const CreatePostForm = dynamic(
  () =>
    import("@/shared/components/organisms/create-post-form"),
);

// sm-md (72px): icon centered, no gap/padding for text
// lg+  (260px): icon + text, left-aligned with gap
const ITEM = [
  "flex items-center w-full rounded-xl transition-colors duration-150",
  "hover:bg-accent active:bg-accent/80 cursor-pointer select-none",
  "sm:justify-center sm:px-0 sm:py-3",
  "lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5",
  "h-12 border-none shadow-none",
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
  const router = useRouter();

  const { isVisible: notiOpen, setIsVisible: setNotiOpen } = popupNotificationtStore();
  const closeNoti = () => setNotiOpen(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const { showPopup } = usePopupStore();
  const newMessage = useMessageStore((s) => s.newMessage);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const handleNavigate = (href: string) => {
    closeNoti();
    router.push(href);
  };

  const handleToggleNotification = () => setNotiOpen(!notiOpen);

  const handleOpenCreatePost = () => showPopup("Tạo bài viết", <CreatePostForm />);

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
          <Button
            variant="ghost"
            className={cn(ITEM, (pathname === "/" || pathname === "/home") && "bg-accent")}
            onClick={() => handleNavigate("/home")}
          >
            <IconSlot>
              <HomeNavIcon compareVar={pathname === "/" || pathname === "/home"} />
            </IconSlot>
            <span className={cn(LABEL, pathname === "/" && "font-semibold")}>Trang chủ</span>
          </Button>

          {/* Follow */}
          <Button
            variant="ghost"
            className={cn(ITEM, pathname === "/follow" && "bg-accent")}
            onClick={() => handleNavigate("/follow")}
          >
            <IconSlot>
              <FollowNavIcon compareVar={pathname === "/follow"} />
            </IconSlot>
            <span className={cn(LABEL, pathname === "/follow" && "font-semibold")}>Theo dõi</span>
          </Button>

          {/* Search */}
          <Button
            variant="ghost"
            className={cn(ITEM, pathname === "/search" && "bg-accent")}
            onClick={() => handleNavigate("/search")}
          >
            <IconSlot>
              <SearchIcon className="size-[26px]" strokeWidth={pathname === "/search" ? 2.2 : 1.6} />
            </IconSlot>
            <span className={cn(LABEL, pathname === "/search" && "font-semibold")}>Tìm kiếm</span>
          </Button>

          {/* Message */}
          <Button
            variant="ghost"
            className={cn(ITEM, pathname.startsWith("/message") && "bg-accent")}
            onClick={() => handleNavigate("/message")}
          >
            <IconSlot>
              <span className="relative">
                <MessageNavIcon compareVar={pathname.startsWith("/message")} />
                {newMessage && <Dot />}
              </span>
            </IconSlot>
            <span className={cn(LABEL, pathname.startsWith("/message") && "font-semibold")}>
              Tin nhắn
            </span>
          </Button>

          {/* Notification */}
          <Button
            variant="ghost"
            className={cn(ITEM, notiOpen && "bg-accent")}
            onClick={handleToggleNotification}
          >
            <IconSlot>
              <span className="relative">
                <Bell active={notiOpen} />
                {unreadCount > 0 && <Dot />}
              </span>
            </IconSlot>
            <span className={LABEL}>Thông báo</span>
          </Button>

          {/* Create post */}
          <Button variant="ghost" className={ITEM} onClick={handleOpenCreatePost}>
            <IconSlot>
              <CreatePostNavIcon />
            </IconSlot>
            <span className={LABEL}>Tạo bài viết</span>
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            className={cn(ITEM, pathname === "/profile" && "bg-accent")}
            onClick={() => handleNavigate("/profile")}
          >
            <IconSlot>
              <Avatar className="size-[26px]">
                <AvatarImage src={user.avatar ?? undefined} />
                <AvatarFallback className="text-[8px] font-semibold">
                  {getInitialsFromDisplayName(user?.displayName ?? "")}
                </AvatarFallback>
              </Avatar>
            </IconSlot>
            <span className={cn(LABEL, pathname === "/profile" && "font-semibold")}>
              {user?.displayName ?? ""}
            </span>
          </Button>
        </div>

        {/* Bottom: More */}
        <div className="px-2 pb-4">
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(ITEM, menuOpen && "h-12")}
                onClick={closeNoti}
              >
                <IconSlot>
                  <HamburgerIcon />
                </IconSlot>
                <span className={LABEL}>Thêm</span>
              </Button>
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
          { href: "/home", icon: <HomeNavIcon compareVar={pathname.startsWith("/home")} /> },
          { href: "/follow", icon: <FollowNavIcon compareVar={pathname.startsWith("/follow")} /> },
          {
            href: "/search",
            icon: (
              <SearchIcon
                className="size-[26px]"
                strokeWidth={pathname.startsWith("/search") ? 2.2 : 1.6}
              />
            ),
          },
          { href: "/message", icon: <MessageNavIcon compareVar={pathname.startsWith("/message")} /> },
        ].map(({ href, icon }) => (
          <Button
            key={href}
            variant="ghost"
            className="flex-1 flex items-center justify-center h-full rounded-none"
            onClick={() => handleNavigate(href)}
          >
            {icon}
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          className="flex-1 flex items-center justify-center h-full rounded-none relative"
          onClick={handleToggleNotification}
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
