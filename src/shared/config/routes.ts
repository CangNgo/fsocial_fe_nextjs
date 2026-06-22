export const ROUTES = {
  HOME: "/home",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  PROFILE: (userId: string) => `/profile?id=${userId}`,
  POST: (postId: string) => `/post/${postId}`,
  MESSAGE: "/message",
  FOLLOW: "/follow",
  SEARCH: "/search",
  SETTING: {
    ACCOUNT_BASIC: "/setting/account-basic",
    ACCOUNT_LOGIN: "/setting/account-login",
    ACCOUNT_PRIVACY: "/setting/account-privacy",
  },
  ADMIN: {
    COMPLAINT: "/admin/complaint",
    USER_MANAGEMENT: "/admin/user-management",
    REPORTS: "/admin/reports",
    POLICY_SETTING: "/admin/policy-setting",
    PROFILE: "/admin/profile",
  },
} as const;
