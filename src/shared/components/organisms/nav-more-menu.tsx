"use client";
import { Check, Moon, SettingsIcon, SunMedium } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { KeyIcon, LogoutIcon, SwitchIcon } from "@/shared/components/atoms/icon/icon";
import { ChangePasswordModal } from "@/shared/components/organisms/change-password-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";
import { usePopupStore } from "@/shared/stores/popup-store";
import { useThemeStore } from "@/shared/stores/theme-store";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";

const navMoreClass =
  "w-full flex items-center gap-4 px-2 py-3 rounded-md hover:bg-accent active:bg-accent/80 justify-start transition";

interface NavMoreMenuProps {
  inMobile?: boolean;
  setPopoverOpen: (open: boolean) => void;
}

export function NavMoreMenu({ inMobile, setPopoverOpen }: NavMoreMenuProps) {
  const { theme, setTheme } = useThemeStore();
  const pathname = usePathname();
  const isInSetting = pathname.startsWith("/setting");
  const [switchThemeOpen, setSwitchThemeOpen] = useState(false);
  const router = useRouter();
  const { setRefreshToken } = validRefreshTokenStore();
  const { showPopup } = usePopupStore();

  const handleLogout = () => {
    setRefreshToken(null);
    router.push("/login");
  };

  const handlePopupChangePassword = () => {
    setPopoverOpen(false);
    showPopup(null, <ChangePasswordModal />);
  };

  return (
    <>
      <Link
        href={!isInSetting ? "/setting/account-basic" : "#"}
        className={navMoreClass}
        onClick={() => setPopoverOpen(false)}
      >
        <SettingsIcon className="size-[26px]" strokeWidth={1.6} />
        <span>Cài đặt</span>
      </Link>

      <Popover onOpenChange={setSwitchThemeOpen}>
        <PopoverTrigger className={cn(navMoreClass, switchThemeOpen && "bg-accent")}>
          {theme === "light" ? (
            <SunMedium className="size-[26px]" strokeWidth={1.6} />
          ) : (
            <Moon className="size-[26px]" strokeWidth={1.6} />
          )}
          <span>Chế độ hiển thị</span>
        </PopoverTrigger>
        <PopoverContent
          side={!inMobile ? "right" : "top"}
          align="start"
          sideOffset={!inMobile ? 20 : 0}
          className="bg-background p-2 sm:w-44 space-y-2 transition"
        >
          <Link
            href=""
            className={cn(navMoreClass, "!gap-2 border", theme === "light" && "shadow-md")}
            onClick={() => setTheme("light")}
          >
            <SunMedium strokeWidth={1.6} />
            <span>Sáng</span>
            <Check className={cn("ms-auto size-5", theme !== "light" && "hidden")} />
          </Link>
          <Link
            href=""
            className={cn(navMoreClass, "!gap-2 border", theme === "dark" && "bg-accent")}
            onClick={() => setTheme("dark")}
          >
            <Moon strokeWidth={1.4} />
            <span>Tối</span>
            <Check className={cn("ms-auto size-5", theme !== "dark" && "hidden")} />
          </Link>
        </PopoverContent>
      </Popover>

      <Link href="" className={navMoreClass} onClick={handlePopupChangePassword}>
        <KeyIcon />
        <span>Đổi mật khẩu</span>
      </Link>

      <hr className="my-1 transition" />

      <Link href="" className={navMoreClass}>
        <SwitchIcon />
        <span>Đổi tài khoản</span>
      </Link>

      <Link href="" className={navMoreClass} onClick={handleLogout}>
        <LogoutIcon />
        <span>Đăng xuất</span>
      </Link>
    </>
  );
}
