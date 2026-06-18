import { LockKeyholeIcon, ShieldCheckIcon, UserRound } from "lucide-react";

export interface SettingNavRoute {
  to: string;
  icon: React.ReactNode;
  content: string;
}

export const settingNavRoute: SettingNavRoute[] = [
  {
    to: "/setting/account-basic",
    icon: <UserRound className="stroke-[1.5px]" />,
    content: "Thông tin cá nhân",
  },
  {
    to: "/setting/account-login",
    icon: <LockKeyholeIcon className="stroke-[1.5px]" />,
    content: "Thông tin đăng nhập",
  },
  {
    to: "/setting/account-privacy",
    icon: <ShieldCheckIcon className="stroke-[1.5px]" />,
    content: "Cài đặt riêng tư",
  },
];
