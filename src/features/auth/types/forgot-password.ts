export interface ForgotPasswordStep1FormData {
  email: string;
}

export interface ForgotPasswordStep2FormData {
  password: string;
  rePassword: string;
}

export interface ForgotPasswordApiResponse {
  statusCode?: number;
  message?: string;
}
