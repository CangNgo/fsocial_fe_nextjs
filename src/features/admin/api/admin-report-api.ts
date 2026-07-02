import { apiGet } from "@/shared/api/core/api-service";

export const getNumberOfPost = async (startDate?: string, endDate?: string): Promise<unknown> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/statistics_post_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate) endpoint = `/statistics_post_today?date_time=${startDate}`;
  else return null;

  return apiGet(endpoint);
};

export const getNumberOfNewRegistration = async (
  startDate?: string,
  endDate?: string,
): Promise<unknown> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/statistics_register_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate) endpoint = `/statistics_register_today?date_time=${startDate}`;
  else return null;

  return apiGet(endpoint);
};

export const getNumberOfComplaint = async (
  startDate?: string,
  endDate?: string,
): Promise<unknown> => {
  let endpoint: string;
  if (startDate && endDate)
    endpoint = `/complaint/statistics_complaint_start_end?startDate=${startDate}&endDate=${endDate}`;
  else if (startDate)
    endpoint = `/complaint/statistics_complaint_today?date_time=${startDate}`;
  else return null;

  return apiGet(endpoint);
};

export const getGender = async (): Promise<unknown> => {
  return apiGet("/report/gender");
};

export const getKOL = async (): Promise<unknown> => {
  return apiGet("/report/kol");
};
