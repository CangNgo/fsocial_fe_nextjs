import type { ChartConfig } from "@/shared/components/ui/chart";

export interface ChartDataItem {
  label: string;
  value: number;
}

export interface GenderDataItem {
  label: string;
  value: number;
  fill: string;
}

export interface KOLItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  numberFollowers: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const fakeChartDataGender: GenderDataItem[] = [
  { label: "male", value: 275, fill: "var(--orange-chart-clr)" },
  { label: "female", value: 200, fill: "var(--blue-chart-clr)" },
  { label: "others", value: 287, fill: "var(--green-chart-clr)" },
];

export const fakeTopKOL: KOLItem[] = [
  {
    id: "djosi32",
    firstName: "Phúc",
    lastName: "Thịnh",
    username: "phucthinh1203",
    avatar: "/temp/user_2.png",
    numberFollowers: 843,
  },
  {
    id: "5yreved",
    firstName: "Phương",
    lastName: "Nam",
    username: "phuongnam54332",
    avatar: "/temp/user_3.png",
    numberFollowers: 700,
  },
  {
    id: "gfd45te",
    firstName: "Đức",
    lastName: "Khải",
    username: "phuongnam54332",
    avatar: "/temp/user_4.png",
    numberFollowers: 476,
  },
  {
    id: "rety5yrv4",
    firstName: "Cang",
    lastName: "Tấn",
    username: "phucthinh1203",
    avatar: "/temp/user_5.png",
    numberFollowers: 412,
  },
  {
    id: "k8oiujhg",
    firstName: "Phúc",
    lastName: "Thịnh",
    username: "phucthinh1203",
    avatar: "/temp/user_6.png",
    numberFollowers: 188,
  },
];

export const chartConfigPosts: ChartConfig = {
  value: {
    label: "Số lượng bài đăng mới",
    color: "var(--orange-chart-clr)",
  },
};

export const chartConfigNumberCreatedAccounts: ChartConfig = {
  value: {
    label: "Số lượng tài khoản mới",
    color: "var(--blue-chart-clr)",
  },
};

export const chartConfigNumberComplaints: ChartConfig = {
  value: {
    label: "Số lượng khiếu nại",
    color: "var(--green-chart-clr)",
  },
};

export const chartConfigGender: ChartConfig = {
  amount: { label: "Số lượng" },
  male: { label: "Nam", color: "var(--orange-chart-clr)" },
  female: { label: "Nữ", color: "var(--blue-chart-clr)" },
  others: { label: "Khác", color: "var(--green-chart-clr)" },
};

export const analyzeTemplate = [
  {
    label: "Hôm nay",
    from: new Date(),
    to: new Date(),
  },
  {
    label: "7 ngày trước",
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  },
  {
    label: "14 ngày trước",
    from: new Date(new Date().setDate(new Date().getDate() - 14)),
    to: new Date(),
  },
  {
    label: "Tháng trước",
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59),
  },
  {
    label: "Từ đầu năm",
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  },
];

export function dateClassToISO8601(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function dateTimeToReportsLabel(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function reFormatDataReports(
  data: Array<{ hour?: number; date?: string; count: number }>,
): ChartDataItem[] {
  return data.map((item) => {
    let label: string;
    if (item.hour !== undefined) {
      label = `${item.hour.toString().padStart(2, "0")}:00`;
    } else {
      label = dateTimeToReportsLabel(item.date ?? "");
    }
    return { label, value: item.count };
  });
}
