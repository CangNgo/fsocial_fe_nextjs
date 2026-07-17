"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { HamburgerIcon, LogoFSAdmin } from "@/shared/components/atoms/icon/icon";
import { AdminMoreMenu } from "@/shared/components/organisms/admin-more-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { adminNavRoute } from "@/shared/config/admin-nav-route";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { adminStore } from "@/shared/stores/admin-store";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";

const btnClass = [
  "w-full flex items-center rounded-xl transition-colors duration-150",
  "hover:bg-accent active:bg-accent/80 cursor-pointer select-none",
  "sm:justify-center sm:px-0 sm:py-3",
  "lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5",
  "h-12 border-none shadow-none",
].join(" ");

const LABEL = "hidden lg:block text-sm font-medium";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = adminStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        "hidden sm:flex flex-col justify-between",
        "sticky top-0 h-screen flex-shrink-0",
        "bg-background border-r overflow-y-auto overflow-x-hidden",
        "w-[72px] lg:w-[280px]",
        "transition-[width] duration-200 ease-in-out",
      )}
    >
      <div className="flex flex-col gap-0.5 pt-4 px-2">
        <div className="flex justify-center lg:justify-start lg:pl-1 mb-3 py-1">
          <LogoFSAdmin />
        </div>

        {adminNavRoute.map((route) => (
          <Link
            key={route.to}
            href={route.to}
            className={cn(btnClass, pathname === route.to && "bg-accent font-medium")}
          >
            {route.icon}
            <span className={LABEL}>{route.name}</span>
          </Link>
        ))}
        <Link
          href={ROUTES.ADMIN.PROFILE}
          className={cn(btnClass, pathname === ROUTES.ADMIN.PROFILE && "bg-accent font-medium")}
        >
          <Avatar className="size-[26px]">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-[10px] font-semibold">
              {combineIntoAvatarName(user.firstName ?? "", user.lastName ?? "")}
            </AvatarFallback>
          </Avatar>
          <span className={LABEL}>
            {combineIntoDisplayName(user.firstName ?? "", user.lastName ?? "")}
          </span>
        </Link>
      </div>

      <div className="px-2 pb-4">
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn(btnClass, menuOpen && "bg-accent")}>
              <HamburgerIcon />
              <span className={LABEL}>Thêm</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={12}
            className="bg-background w-72 border shadow-xl p-2"
          >
            <AdminMoreMenu setPopoverOpen={setMenuOpen} />
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
