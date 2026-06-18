// @ts-nocheck
"use client";

import { MessageSquareWarning, Star } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/atoms/chart";
import {
  CrownTop1Icon,
  CrownTop2Icon,
  CrownTop3Icon,
  GenderIcon,
  NewCreatedAccountIcon,
  PostProfileTabIcon,
} from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/input";
import {
  getNumberOfComplaint,
  getNumberOfNewRegistration,
  getNumberOfPost,
} from "@/lib/api/admin/adminReportApi";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/utils/combineName";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartDataItem {
  label: string;
  value: number;
}

interface GenderDataItem {
  label: string;
  value: number;
  fill: string;
}

interface KOLItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  numberFollowers: number;
}

// ---------------------------------------------------------------------------
// Fake fallback data (mirrors fakeDataAdminReports.ts from legacy project)
// ---------------------------------------------------------------------------

const fakeChartDataGender: GenderDataItem[] = [
  { label: "male", value: 275, fill: "var(--orange-chart-clr)" },
  { label: "female", value: 200, fill: "var(--blue-chart-clr)" },
  { label: "others", value: 287, fill: "var(--green-chart-clr)" },
];

const fakeTopKOL: KOLItem[] = [
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

// ---------------------------------------------------------------------------
// Chart configs
// ---------------------------------------------------------------------------

const chartConfigPosts: ChartConfig = {
  value: {
    label: "Số lượng bài đăng mới",
    color: "var(--orange-chart-clr)",
  },
};

const chartConfigNumberCreatedAccounts: ChartConfig = {
  value: {
    label: "Số lượng tài khoản mới",
    color: "var(--blue-chart-clr)",
  },
};

const chartConfigNumberComplaints: ChartConfig = {
  value: {
    label: "Số lượng khiếu nại",
    color: "var(--green-chart-clr)",
  },
};

const chartConfigGender: ChartConfig = {
  amount: { label: "Số lượng" },
  male: { label: "Nam", color: "var(--orange-chart-clr)" },
  female: { label: "Nữ", color: "var(--blue-chart-clr)" },
  others: { label: "Khác", color: "var(--green-chart-clr)" },
};

// ---------------------------------------------------------------------------
// Date preset templates
// ---------------------------------------------------------------------------

const analyzeTemplate = [
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function dateClassToISO8601(date: Date): string {
  return date.toISOString().split("T")[0];
}

function dateTimeToReportsLabel(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Sub-component: RenderLineChart
// ---------------------------------------------------------------------------

interface RenderLineChartProps {
  icon: React.ReactNode;
  label: string;
  total: number;
  idFill: string;
  colorClassName: string;
  data: ChartDataItem[];
  config: ChartConfig;
  amountHorizoneLine: number;
  legend: boolean;
}

function RenderLineChart({
  icon,
  label,
  total,
  idFill,
  colorClassName,
  data,
  config,
  amountHorizoneLine,
  legend,
}: RenderLineChartProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="border shadow rounded-full size-8 grid place-content-center fill-gray">
          {icon}
        </span>
        <span className="flex-grow fs-xs text-gray">{label}</span>
        <div className="w-fit text-end">
          <span className="fs-xs text-gray">Tổng</span>
          <h4 className={colorClassName}>{total}</h4>
        </div>
      </div>
      <ChartContainer config={config} className="size-full flex-grow min-h-0">
        <AreaChart accessibilityLayer data={data} margin={{ left: -20, right: 12 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-1 stroke-gray-2light"
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: string) => value.slice(0, 5)}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickCount={amountHorizoneLine} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id={`fill-${idFill}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <Area
            dataKey="value"
            type="natural"
            fill={`url(#fill-${idFill})`}
            fillOpacity={0.4}
            stroke="var(--color-value)"
            stackId="a"
          />
          {legend && <ChartLegend content={<ChartLegendContent />} />}
        </AreaChart>
      </ChartContainer>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface DateRange {
  from: Date;
  to: Date;
}

export function AdminReportsDashboard() {
  const [chartDataPosts, setChartDataPosts] = useState<ChartDataItem[]>([]);
  const [chartDataNumberCreatedAccounts, setChartDataNumberCreatedAccounts] = useState<
    ChartDataItem[]
  >([]);
  const [chartDataNumberComplaints, setChartDataNumberComplaints] = useState<ChartDataItem[]>([]);
  const [topKOL, setTopKOL] = useState<KOLItem[]>([]);

  const totalPosts = chartDataPosts.reduce((sum, item) => item.value + sum, 0);
  const totalCreatedAccount = chartDataNumberCreatedAccounts.reduce(
    (sum, item) => item.value + sum,
    0,
  );
  const totalComplaint = chartDataNumberComplaints.reduce((sum, item) => item.value + sum, 0);
  const totalVisitors = fakeChartDataGender.reduce((sum, item) => sum + item.value, 0);

  const [templateSelect, setTemplateSelect] = useState(-1);
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const reFormatDataReports = (
    data: Array<{ hour?: number; date?: string; count: number }>,
  ): ChartDataItem[] => {
    return data.map((item) => {
      let label: string;
      if (item.hour !== undefined) {
        label = `${item.hour.toString().padStart(2, "0")}:00`;
      } else {
        label = dateTimeToReportsLabel(item.date ?? "");
      }
      return { label, value: item.count };
    });
  };

  const fetchReports = async () => {
    const start = dateClassToISO8601(date?.from ?? new Date());
    const end =
      date?.from && date?.to && date.from.toDateString() !== date.to.toDateString()
        ? dateClassToISO8601(date.to)
        : null;

    const [respPostCreated, respRegistration, respComplaint] = await Promise.all([
      getNumberOfPost(start, end),
      getNumberOfNewRegistration(start, end),
      getNumberOfComplaint(start, end),
    ]);

    if (respPostCreated && respPostCreated.statusCode === 200) {
      setChartDataPosts(reFormatDataReports(respPostCreated.data));
    }
    if (respRegistration && respRegistration.statusCode === 200) {
      setChartDataNumberCreatedAccounts(reFormatDataReports(respRegistration.data));
    }
    if (respComplaint && respComplaint.statusCode === 200) {
      setChartDataNumberComplaints(reFormatDataReports(respComplaint.data));
    }

    setTopKOL(fakeTopKOL);
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReports]);

  const handleOnSelectDateFrom = (value: string) => {
    setTemplateSelect(-1);
    setDate((prev) => ({ ...prev, from: new Date(value) }));
  };

  const handleOnSelectDateTo = (value: string) => {
    setTemplateSelect(-1);
    setDate((prev) => ({ ...prev, to: new Date(value) }));
  };

  const handleAcceptDate = () => {
    fetchReports();
  };

  const handleCancelDate = () => {
    setTemplateSelect(-1);
    setDate({ from: new Date(), to: new Date() });
  };

  const handleSetTemplate = (template: { from: Date; to: Date }, index: number) => {
    setTemplateSelect(index);
    setDate({ from: template.from, to: template.to });
  };

  return (
    <div className="flex-grow grid grid-cols-12 gap-4 grid-rows-2">
      {/* Posts area chart */}
      <div className="col-span-8 p-3 bg-background rounded-lg border shadow flex flex-col">
        <RenderLineChart
          icon={<PostProfileTabIcon className="size-3.5" />}
          label="Số lượng bài đăng"
          total={totalPosts}
          idFill="numberPosts"
          colorClassName="text-chart-orange"
          data={chartDataPosts}
          config={chartConfigPosts}
          amountHorizoneLine={5}
          legend={true}
        />
      </div>

      {/* Date picker */}
      <div className="col-span-4 bg-background rounded-lg border shadow flex gap-2 p-2">
        <div className="flex-grow space-y-1">
          {analyzeTemplate.map((templatePicker, index) => (
            <Button
              type="button"
              key={templatePicker.label}
              className={`w-full text-left p-2 rounded-md hover:bg-gray-3light font-medium text-gray fs-xs ${
                templateSelect === index && "bg-gray-2light text-primary-text"
              }`}
              onClick={() => handleSetTemplate(templatePicker, index)}
            >
              {templatePicker.label}
            </Button>
          ))}
        </div>
        <div>
          {/* Simple date range inputs as Next.js Calendar component may not be available */}
          <div className="flex flex-col gap-2 p-2">
            <label htmlFor="report-date-from" className="fs-xs text-gray">
              Từ ngày
            </label>
            <Input
              id="report-date-from"
              type="date"
              value={dateClassToISO8601(date.from)}
              onChange={(e) => handleOnSelectDateFrom(e.target.value)}
              className="custom-input fs-xs"
            />
            <label htmlFor="report-date-to" className="fs-xs text-gray">
              Đến ngày
            </label>
            <Input
              id="report-date-to"
              type="date"
              value={dateClassToISO8601(date.to)}
              onChange={(e) => handleOnSelectDateTo(e.target.value)}
              className="custom-input fs-xs"
            />
          </div>
          <div className="flex gap-4 mt-1">
            <Button
              type="button"
              className="fs-xs px-8 py-1.5 btn-primary text-nowrap"
              onClick={handleAcceptDate}
            >
              Thống kê
            </Button>
            <Button
              type="button"
              className="fs-xs px-8 py-1.5 btn-transparent border text-nowrap"
              onClick={handleCancelDate}
            >
              Đặt lại
            </Button>
          </div>
        </div>
      </div>

      {/* Double charts */}
      <div className="col-span-6 bg-background p-3 rounded-lg border shadow grid grid-rows-2 gap-2">
        <div className="flex flex-col">
          <RenderLineChart
            icon={<NewCreatedAccountIcon />}
            label="Lượt tạo tài khoản mới"
            total={totalCreatedAccount}
            idFill="numberCreatedAccounts"
            colorClassName="text-chart-blue"
            data={chartDataNumberCreatedAccounts}
            config={chartConfigNumberCreatedAccounts}
            amountHorizoneLine={2}
            legend={false}
          />
        </div>
        <div className="flex flex-col">
          <RenderLineChart
            icon={<MessageSquareWarning className="size-4 stroke-gray" />}
            label="Lượt khiếu nại"
            total={totalComplaint}
            idFill="numberComplaints"
            colorClassName="text-chart-green"
            data={chartDataNumberComplaints}
            config={chartConfigNumberComplaints}
            amountHorizoneLine={2}
            legend={false}
          />
        </div>
      </div>

      {/* Gender pie chart */}
      <div className="col-span-3 bg-background p-3 rounded-lg border shadow">
        <div className="flex items-center gap-3">
          <span className="border shadow rounded-full size-8 grid place-content-center fill-gray">
            <GenderIcon />
          </span>
          <span className="flex-grow fs-xs text-gray">Thống kê giới tính</span>
        </div>
        <ChartContainer config={chartConfigGender} className="aspect-square">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={fakeChartDataGender}
              dataKey="value"
              nameKey="label"
              innerRadius={55}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-primary-text text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-gray">
                          tài khoản
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent />} />
          </PieChart>
        </ChartContainer>
      </div>

      {/* Top KOL */}
      <div className="pb-1 col-span-3 bg-background rounded-lg border shadow flex flex-col">
        <div className="p-3 flex items-center gap-3">
          <span className="border shadow rounded-full size-8 grid place-content-center">
            <Star className="size-4 stroke-gray" />
          </span>
          <span className="flex-grow fs-xs text-gray">Bảng xếp hạng KOL</span>
        </div>
        <div className="flex-grow overflow-y-auto">
          {topKOL.map((kol, index) => (
            <div key={kol.id} className="px-4 py-2 flex gap-3 items-center hover:bg-gray-3light">
              <span className="fs-xs">{index + 1}</span>
              <div className="relative">
                <Avatar className="size-10">
                  <AvatarImage src={kol.avatar} />
                  <AvatarFallback className="text-[12px]">
                    {combineIntoAvatarName(kol.firstName, kol.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3">
                  {index + 1 === 1 && <CrownTop1Icon />}
                  {index + 1 === 2 && <CrownTop2Icon />}
                  {index + 1 === 3 && <CrownTop3Icon />}
                </div>
              </div>
              <div className="flex-grow">
                <p className="font-medium fs-sm">
                  {combineIntoDisplayName(kol.firstName, kol.lastName)}
                </p>
                <Link href="" className="fs-xs text-gray hover:underline">
                  {kol.username}
                </Link>
              </div>
              <span className="fs-xs">{kol.numberFollowers}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
