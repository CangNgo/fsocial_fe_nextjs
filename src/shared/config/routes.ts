export const ROUTES = {
  ROOT: "/",
  HOME: "/home",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  PROFILE_BASE: "/profile",
  PROFILE: (userId: string) => `/profile?id=${userId}`,
  POST_BASE: "/post",
  POST: (postId: string) => `/${postId}`,
  MESSAGE: "/message",
  FOLLOW: "/follow",
  SEARCH: "/search",
  OAUTH2_CALLBACK: "/oauth2/callback",
  GOOGLE_OAUTH_AUTHORIZE: "/oauth2/authorization/google",
  SETTING: {
    PREFIX: "/setting",
    ROOT: "/setting/account-basic",
    ACCOUNT_BASIC: "/setting/account-basic",
    ACCOUNT_LOGIN: "/setting/account-login",
    ACCOUNT_PRIVACY: "/setting/account-privacy",
  },
  ADMIN: {
    PREFIX: "/admin",
    COMPLAINT: "/admin/complaint",
    USER_MANAGEMENT: "/admin/user-management",
    REPORTS: "/admin/reports",
    POLICY_SETTING: "/admin/policy-setting",
    PROFILE: "/admin/profile",
  },
} as const;

export const GUEST_ONLY_PATHS = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD] as const;

export const USER_PATHS = [
  ROUTES.HOME,
  ROUTES.FOLLOW,
  ROUTES.SEARCH,
  ROUTES.MESSAGE,
  ROUTES.PROFILE_BASE,
  ROUTES.POST_BASE,
  ROUTES.SETTING.PREFIX,
] as const;
