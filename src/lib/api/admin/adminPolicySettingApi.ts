import { apiDelete, apiGet, apiPost } from "../apiService";

export const getPolicies = async (): Promise<unknown> => {
  return apiGet("/policy");
};

export const postPolicies = async (listPolicy: unknown): Promise<unknown> => {
  return apiPost("/post/policy", listPolicy);
};

export const getTermOfService = async (): Promise<unknown> => {
  return apiGet("/post/term_of_service");
};

export const removeTermOfService = async (id: string): Promise<unknown> => {
  return apiDelete(`/post/term_of_service?term_id=${id}`);
};

export const addTermOfService = async (name: string): Promise<unknown> => {
  return apiPost("/post/term_of_service", { name });
};
