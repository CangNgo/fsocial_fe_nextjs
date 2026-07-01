"use client";

import type React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import type { ChartDataItem } from "../../utils/admin-report-utils";

interface AdminLineChartProps {
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

export function AdminLineChart({
  icon,
  label,
  total,
  idFill,
  colorClassName,
  data,
  config,
  amountHorizoneLine,
  legend,
}: AdminLineChartProps) {
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
