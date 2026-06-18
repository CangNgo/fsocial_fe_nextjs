"use client";
import { Check, Moon, SunMedium } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { LogoFSAdmin, LogoutIcon } from "@/components/atoms/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";
import { adminNavRoute } from "@/config/adminNavRoute";
import { cn } from "@/lib/utils";
import { adminStore } from "@/store/adminStore";
import { useThemeStore } from "@/store/themeStore";
import { validRefreshTokenStore } from "@/store/validRefreshTokenStore";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/utils/combineName";

const btnClass =
  "w-full flex items-center gap-3 p-3 py-3.5 rounded-md hover:bg-accent transition text-left";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = adminStore();
  const { theme, setTheme } = useThemeStore();
  const [switchThemeOpen, setSwitchThemeOpen] = useState(false);
  const { setRefreshToken } = validRefreshTokenStore();

  const handleLogout = () => {
    setRefreshToken(null);
    router.push("/login");
  };

  return (
    <nav className="rounded-lg w-[280px] flex flex-col flex-shrink-0 bg-background h-full p-5 border shadow">
      <LogoFSAdmin />

      <div className="mt-8 space-y-3 flex-grow">
        {adminNavRoute.map((route) => (
          <Link
            key={route.to}
            href={route.to}
            className={cn(btnClass, pathname === route.to && "bg-accent font-medium")}
          >
            {route.icon}
            {route.name}
          </Link>
        ))}
        <Link
          href="/admin/profile"
          className={cn(btnClass, pathname === "/admin/profile" && "bg-accent font-medium")}
        >
          <Avatar className="size-[26px]">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-[10px] font-semibold">
              {combineIntoAvatarName(user.firstName ?? "", user.lastName ?? "")}
            </AvatarFallback>
          </Avatar>
          <span>{combineIntoDisplayName(user.firstName ?? "", user.lastName ?? "")}</span>
        </Link>
      </div>

      <div>
        <Popover onOpenChange={setSwitchThemeOpen}>
          <PopoverTrigger className={cn(btnClass, switchThemeOpen && "bg-accent")}>
            {theme === "light" ? <SunMedium /> : <Moon />}
            <span>Chế độ hiển thị</span>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            align="end"
            sideOffset={20}
            className="bg-background p-2 sm:w-44 space-y-2 transition"
          >
            <Button
              type="button"
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md border hover:bg-accent",
                theme === "light" && "shadow-md",
              )}
              onClick={() => setTheme("light")}
            >
              <SunMedium />
              <span>Sáng</span>
              <Check className={cn("ms-auto size-5", theme !== "light" && "hidden")} />
            </Button>
            <Button
              type="button"
              className={cn(
                "w-full flex items-center gap-2 p-2 rounded-md border hover:bg-accent",
                theme === "dark" && "bg-accent",
              )}
              onClick={() => setTheme("dark")}
            >
              <Moon />
              <span>Tối</span>
              <Check className={cn("ms-auto size-5", theme !== "dark" && "hidden")} />
            </Button>
          </PopoverContent>
        </Popover>

        <Button type="button" className={cn(btnClass, "hover:bg-accent")} onClick={handleLogout}>
          <LogoutIcon />
          Đăng xuất
        </Button>
      </div>
    </nav>
  );
}
