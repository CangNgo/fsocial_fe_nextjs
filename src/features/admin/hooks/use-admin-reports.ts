"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminKeys } from "@/services/admin/admin.key";
import {
  getNumberOfComplaint,
  getNumberOfNewRegistration,
  getNumberOfPost,
} from "@/services/admin/admin-report-api";
import {
  type DateRange,
  dateClassToISO8601,
  fakeChartDataGender,
  fakeTopKOL,
  reFormatDataReports,
} from "../utils/admin-report-utils";

export function useAdminReports() {
  const [templateSelect, setTemplateSelect] = useState(-1);
  const [date, setDate] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [appliedDate, setAppliedDate] = useState<DateRange>(date);

  const start = dateClassToISO8601(appliedDate.from);
  const end =
    appliedDate.from.toDateString() !== appliedDate.to.toDateString()
      ? dateClassToISO8601(appliedDate.to)
      : undefined;

  const postsQuery = useQuery({
    queryKey: [...adminKeys.reports.all, "posts", start, end],
    queryFn: () => getNumberOfPost(start, end),
    select: (resp) => (resp?.statusCode === 200 ? reFormatDataReports(resp.data ?? []) : []),
  });

  const registrationsQuery = useQuery({
    queryKey: [...adminKeys.reports.all, "registrations", start, end],
    queryFn: () => getNumberOfNewRegistration(start, end),
    select: (resp) => (resp?.statusCode === 200 ? reFormatDataReports(resp.data ?? []) : []),
  });

  const complaintsQuery = useQuery({
    queryKey: [...adminKeys.reports.all, "complaints", start, end],
    queryFn: () => getNumberOfComplaint(start, end),
    select: (resp) => (resp?.statusCode === 200 ? reFormatDataReports(resp.data ?? []) : []),
  });

  const chartDataPosts = postsQuery.data ?? [];
  const chartDataNumberCreatedAccounts = registrationsQuery.data ?? [];
  const chartDataNumberComplaints = complaintsQuery.data ?? [];
  const topKOL = fakeTopKOL;

  const totalPosts = chartDataPosts.reduce((sum, item) => item.value + sum, 0);
  const totalCreatedAccount = chartDataNumberCreatedAccounts.reduce(
    (sum, item) => item.value + sum,
    0,
  );
  const totalComplaint = chartDataNumberComplaints.reduce((sum, item) => item.value + sum, 0);
  const totalVisitors = fakeChartDataGender.reduce((sum, item) => sum + item.value, 0);

  const handleOnSelectDateFrom = (value: string) => {
    setTemplateSelect(-1);
    setDate((prev) => ({ ...prev, from: new Date(value) }));
  };

  const handleOnSelectDateTo = (value: string) => {
    setTemplateSelect(-1);
    setDate((prev) => ({ ...prev, to: new Date(value) }));
  };

  const handleAcceptDate = () => {
    setAppliedDate(date);
  };

  const handleCancelDate = () => {
    setTemplateSelect(-1);
    const reset = { from: new Date(), to: new Date() };
    setDate(reset);
    setAppliedDate(reset);
  };

  const handleSetTemplate = (template: DateRange, index: number) => {
    setTemplateSelect(index);
    setDate({ from: template.from, to: template.to });
    setAppliedDate({ from: template.from, to: template.to });
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
