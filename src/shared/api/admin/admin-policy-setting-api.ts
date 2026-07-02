import { apiDelete, apiGet, apiPost } from "../core/api-service";

export const getPolicies = async (): Promise<unknown> => {
  return apiGet("/policy");
};

export const postPolicies = async (listPolicy: unknown): Promise<unknown> => {
  return apiPost("/policy", listPolicy);
};

export const getTermOfService = async (): Promise<unknown> => {
  return apiGet("/term_of_service");
};

export const removeTermOfService = async (id: string): Promise<unknown> => {
  return apiDelete(`/term_of_service?term_id=${id}`);
};

export const addTermOfService = async (name: string): Promise<unknown> => {
  return apiPost("/term_of_service", { name });
};
