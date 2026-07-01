export interface SignupStep1FormData {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
}

export interface SignupStep2FormData {
  username: string;
  email: string;
  password: string;
  rePassword: string;
}

export interface SignupApiResponse {
  statusCode?: number;
  message?: string;
  data?: Record<string, string>;
}
