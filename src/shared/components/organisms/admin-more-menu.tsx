"use client";
import { Check, Moon, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoutIcon } from "@/shared/components/atoms/icon/icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { ROUTES } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";
import { useThemeStore } from "@/shared/stores/theme-store";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";

const itemClass =
  "w-full flex items-center gap-4 px-2 py-3 rounded-md hover:bg-accent active:bg-accent/80 justify-start transition";

interface AdminMoreMenuProps {
  setPopoverOpen: (open: boolean) => void;
}

export function AdminMoreMenu({ setPopoverOpen }: AdminMoreMenuProps) {
  const { theme, setTheme } = useThemeStore();
  const [switchThemeOpen, setSwitchThemeOpen] = useState(false);
  const router = useRouter();
  const { setRefreshToken } = validRefreshTokenStore();

  const handleLogout = () => {
    setPopoverOpen(false);
    setRefreshToken(null);
    router.push(ROUTES.LOGIN);
  };

  return (
    <>
      <Popover onOpenChange={setSwitchThemeOpen}>
        <PopoverTrigger className={cn(itemClass, switchThemeOpen && "bg-accent")}>
          {theme === "light" ? <SunMedium /> : <Moon />}
          <span>Chế độ hiển thị</span>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={20}
          className="bg-background p-2 sm:w-44 space-y-2 transition"
        >
          <button
            type="button"
            className={cn(itemClass, "!gap-2 border", theme === "light" && "shadow-md")}
            onClick={() => setTheme("light")}
          >
            <SunMedium />
            <span>Sáng</span>
            <Check className={cn("ms-auto size-5", theme !== "light" && "hidden")} />
          </button>
          <button
            type="button"
            className={cn(itemClass, "!gap-2 border", theme === "dark" && "bg-accent")}
            onClick={() => setTheme("dark")}
          >
            <Moon />
            <span>Tối</span>
            <Check className={cn("ms-auto size-5", theme !== "dark" && "hidden")} />
          </button>
        </PopoverContent>
      </Popover>

      <hr className="my-1 transition" />

      <button type="button" className={itemClass} onClick={handleLogout}>
        <LogoutIcon />
        <span>Đăng xuất</span>
      </button>
    </>
  );
}
