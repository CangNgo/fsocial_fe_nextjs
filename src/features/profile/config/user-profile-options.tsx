import { ShieldCheckIcon, UserRound } from "lucide-react";

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
      to: "/setting/account-basic",
      icon: <UserRound className="stroke-[1.5px]" />,
      content: <span>Thông tin cá nhân</span>,
    },
    {
      to: "/setting/account-privacy",
      icon: <ShieldCheckIcon className="stroke-[1.5px]" />,
      content: <span>Cài đặt riêng tư</span>,
    },
  ],
  OTHER: [],
};
