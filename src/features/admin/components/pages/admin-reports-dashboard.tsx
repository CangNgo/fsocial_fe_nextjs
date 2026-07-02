// @ts-nocheck
"use client";

import { MessageSquareWarning, Star } from "lucide-react";
import Link from "next/link";
import { Label, Pie, PieChart } from "recharts";
import {
  CrownTop1Icon,
  CrownTop2Icon,
  CrownTop3Icon,
  GenderIcon,
  NewCreatedAccountIcon,
  PostProfileTabIcon,
} from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Input } from "@/shared/components/ui/input";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";
import { useAdminReports } from "../../hooks/use-admin-reports";
import {
  analyzeTemplate,
  chartConfigGender,
  chartConfigNumberComplaints,
  chartConfigNumberCreatedAccounts,
  chartConfigPosts,
  dateClassToISO8601,
  fakeChartDataGender,
} from "../../utils/admin-report-utils";
import { AdminLineChart } from "../molecules/admin-line-chart";

export default function AdminReportsDashboard() {
  const {
    chartDataPosts,
    chartDataNumberCreatedAccounts,
    chartDataNumberComplaints,
    topKOL,
    totalPosts,
    totalCreatedAccount,
    totalComplaint,
    totalVisitors,
    templateSelect,
    date,
    handleOnSelectDateFrom,
    handleOnSelectDateTo,
    handleAcceptDate,
    handleCancelDate,
    handleSetTemplate,
  } = useAdminReports();

  return (
    <div className="flex-grow grid grid-cols-12 gap-4 grid-rows-2">
      <div className="col-span-8 p-3 bg-background rounded-lg border shadow flex flex-col">
        <AdminLineChart
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

      <div className="col-span-6 bg-background p-3 rounded-lg border shadow grid grid-rows-2 gap-2">
        <div className="flex flex-col">
          <AdminLineChart
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
          <AdminLineChart
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
