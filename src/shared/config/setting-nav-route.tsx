import { LockKeyholeIcon, ShieldCheckIcon, UserRound } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export interface SettingNavRoute {
  to: string;
  icon: React.ReactNode;
  content: string;
}

export const settingNavRoute: SettingNavRoute[] = [
  {
    to: ROUTES.SETTING.MY_PROFILE,
    icon: <UserRound className="stroke-[1.5px]" />,
    content: "Thông tin cá nhân",
  },
  {
    to: ROUTES.SETTING.ACCOUNT_LOGIN,
    icon: <LockKeyholeIcon className="stroke-[1.5px]" />,
    content: "Thông tin đăng nhập",
  },
  {
    to: ROUTES.SETTING.ACCOUNT_PRIVACY,
    icon: <ShieldCheckIcon className="stroke-[1.5px]" />,
    content: "Cài đặt riêng tư",
  },
];
