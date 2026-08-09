import { ShieldCheckIcon, UserRound } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export interface ProfileOption {
  to: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const userProfileOptions: {
  OWNER: ProfileOption[];
  OTHER: ProfileOption[];
} = {
  OWNER: [
    {
      to: ROUTES.SETTING.MY_PROFILE,
      icon: <UserRound className="stroke-[1.5px]" />,
      content: <span>Thông tin cá nhân</span>,
    },
    {
      to: ROUTES.SETTING.ACCOUNT_PRIVACY,
      icon: <ShieldCheckIcon className="stroke-[1.5px]" />,
      content: <span>Cài đặt riêng tư</span>,
    },
  ],
  OTHER: [],
};
