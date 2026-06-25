"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, HamburgerIcon, LogoNoBG } from "@/shared/components/atoms/icon/icon";
import { NavMoreMenu } from "@/shared/components/organisms/nav-more-menu";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { popupNotificationtStore } from "@/shared/stores/popup-store";

export function Header() {
  const pathname = usePathname();
  const isInMessage = pathname === "/message";
  const { isVisible, setIsVisible } = popupNotificationtStore();
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleShowNoti = () => setIsVisible(!isVisible);
  const closeNotification = () => setIsVisible(false);

  return (
    <>
      <header
        className={`z-10 px-3 h-12 bg-background ${!isInMessage ? "sm:hidden" : "hidden"
          } w-full fixed top-0 flex items-center justify-between border-b`}
      >
        <Link href="/">
          <LogoNoBG className="size-8" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative w-fit">
            <Button type="button" className="cursor-pointer" onClick={toggleShowNoti}>
              <Bell />
            </Button>
            {unreadCount > 0 && (
              <div className="absolute size-2.5 -top-[1px] right-[1px] bg-gradient-to-br from-pink-500 to-orange-400 rounded-full" />
            )}
          </div>

          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger onClick={closeNotification}>
              <HamburgerIcon />
            </PopoverTrigger>
            <PopoverContent
              sideOffset={10}
              className="bg-background w-screen h-screen rounded-none shadow-xl p-2"
            >
              <NavMoreMenu inMobile setPopoverOpen={setPopoverOpen} />
            </PopoverContent>
          </Popover>
        </div>
      </header>
    </>
  );
}
