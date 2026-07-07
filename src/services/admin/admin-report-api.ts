import { apiGet } from "@/services/core/api-service";
import type { ApiResponse } from "@/shared/types/api-response";
import type { ReportStatItem } from "@/shared/types/admin";

export const getNumberOfPost = async (
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<ReportStatItem[]> | null> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/statistics_post_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate) endpoint = `/statistics_post_today?date_time=${startDate}`;
  else return null;

  return apiGet<ReportStatItem[]>(endpoint);
};

export const getNumberOfNewRegistration = async (
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<ReportStatItem[]> | null> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/statistics_register_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate) endpoint = `/statistics_register_today?date_time=${startDate}`;
  else return null;

  return apiGet<ReportStatItem[]>(endpoint);
};

export const getNumberOfComplaint = async (
  startDate?: string,
  endDate?: string,
): Promise<ApiResponse<ReportStatItem[]> | null> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/complaint/statistics_complaint_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate) endpoint = `/complaint/statistics_complaint_today?date_time=${startDate}`;
  else return null;

  return apiGet<ReportStatItem[]>(endpoint);
};

export const getGender = async (): Promise<ApiResponse<unknown> | null> => {
  return apiGet("/report/gender");
};

export const getKOL = async (): Promise<ApiResponse<unknown> | null> => {
  return apiGet("/report/kol");
};
