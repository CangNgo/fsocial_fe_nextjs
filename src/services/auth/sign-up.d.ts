
export interface SignupDuplicateData {
  username?: string;
  email?: string;
}

export interface VerifyOtp {
  email: string;
  type: string;
  otp: string;
}

export interface SendOtp {
  email: string;
  type: string;
}

export interface CreateAccountPayload {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
  username: string;
  email: string;
  password: string;
  rePassword: string;
}