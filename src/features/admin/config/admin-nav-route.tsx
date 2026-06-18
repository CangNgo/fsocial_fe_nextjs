import { BookMarked, ChartNoAxesCombined, MessageSquareWarning, UserRoundPen } from "lucide-react";

export interface NavRoute {
  name: string;
  to: string;
  icon: React.ReactNode;
}

export const adminNavRoute: NavRoute[] = [
  {
    name: "Khiếu nại",
    to: "/admin/complaint",
    icon: <MessageSquareWarning strokeWidth={1.6} />,
  },
  {
    name: "Quản lý người dùng",
    to: "/admin/user-management",
    icon: <UserRoundPen strokeWidth={1.6} />,
  },
  {
    name: "Thống kê",
    to: "/admin/reports",
    icon: <ChartNoAxesCombined strokeWidth={1.6} />,
  },
  {
    name: "Cài đặt chính sách",
    to: "/admin/policy-setting",
    icon: <BookMarked strokeWidth={1.6} />,
  },
];
