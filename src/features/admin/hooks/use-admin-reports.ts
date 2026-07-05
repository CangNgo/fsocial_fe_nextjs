"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNumberOfComplaint,
  getNumberOfNewRegistration,
  getNumberOfPost,
} from "../api/admin-report-api";
import {
  type ChartDataItem,
  type DateRange,
  dateClassToISO8601,
  fakeChartDataGender,
  fakeTopKOL,
  type KOLItem,
  reFormatDataReports,
} from "../utils/admin-report-utils";

export function useAdminReports() {
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

  const fetchReports = useCallback(async () => {
    const start = dateClassToISO8601(date?.from ?? new Date());
    const end =
      date?.from && date?.to && date.from.toDateString() !== date.to.toDateString()
        ? dateClassToISO8601(date.to)
        : undefined;

    const [respPostCreated, respRegistration, respComplaint] = (await Promise.all([
      getNumberOfPost(start, end),
      getNumberOfNewRegistration(start, end),
      getNumberOfComplaint(start, end),
    ])) as Array<{
      statusCode?: number;
      data?: Array<{ hour?: number; date?: string; count: number }>;
    } | null>;

    if (respPostCreated && respPostCreated.statusCode === 200) {
      setChartDataPosts(reFormatDataReports(respPostCreated.data ?? []));
    }
    if (respRegistration && respRegistration.statusCode === 200) {
      setChartDataNumberCreatedAccounts(reFormatDataReports(respRegistration.data ?? []));
    }
    if (respComplaint && respComplaint.statusCode === 200) {
      setChartDataNumberComplaints(reFormatDataReports(respComplaint.data ?? []));
    }

    setTopKOL(fakeTopKOL);
  }, [date]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetch reports once on mount; date changes are applied by the accept button
  useEffect(() => {
    queueMicrotask(() => {
      fetchReports();
    });
  }, []);

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

  const handleSetTemplate = (template: DateRange, index: number) => {
    setTemplateSelect(index);
    setDate({ from: template.from, to: template.to });
  };

  return {
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
  };
}
