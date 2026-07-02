import { BookMarked, ChartNoAxesCombined, MessageSquareWarning, UserRoundPen } from "lucide-react";
import { ROUTES } from "@/shared/config/routes";

export interface NavRoute {
  name: string;
  to: string;
  icon: React.ReactNode;
}

export const adminNavRoute: NavRoute[] = [
  {
    name: "Khiếu nại",
    to: ROUTES.ADMIN.COMPLAINT,
    icon: <MessageSquareWarning strokeWidth={1.6} />,
  },
  {
    name: "Quản lý người dùng",
    to: ROUTES.ADMIN.USER_MANAGEMENT,
    icon: <UserRoundPen strokeWidth={1.6} />,
  },
  {
    name: "Thống kê",
    to: ROUTES.ADMIN.REPORTS,
    icon: <ChartNoAxesCombined strokeWidth={1.6} />,
  },
  {
    name: "Cài đặt chính sách",
    to: ROUTES.ADMIN.POLICY_SETTING,
    icon: <BookMarked strokeWidth={1.6} />,
  },
];
