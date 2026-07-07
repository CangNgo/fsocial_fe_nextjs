"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ROUTES } from "@/shared/config/routes";
import { useGoogleLoginMutation } from "./mutations/use-google-auth-mutations";
import { setToken } from "./set-token";

interface GoogleCredentialResponse {
  credential: string;
}

// Chỉ dùng dismissed moment — các method của display/skipped moment
// (isNotDisplayed, getNotDisplayedReason, ...) đã bị FedCM loại bỏ,
// gọi chúng khiến GSI in warning "may stop functioning when FedCM becomes mandatory".
interface PromptMomentNotification {
  isDismissedMoment: () => boolean;
  getDismissedReason: () => string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
    itp_support?: boolean;
  }) => void;
  prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
  renderButton: (
    element: HTMLElement,
    options: {
      theme: string;
      size: string;
      width: number;
      text: string;
      shape: string;
      logo_alignment: string;
    },
  ) => void;
  cancel: () => void;
}

interface GoogleAccounts {
  id: GoogleAccountsId;
}

interface GoogleApi {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: GoogleApi;
  }
}

const GSI_SCRIPT_ID = "google-gsi-script";

// GSI là API global (một script, một lần initialize cho cả app) nên phần load/init
// phải nằm ở module scope: nhiều hook cùng gọi vẫn chỉ load script và initialize một lần,
// và promise sống sót qua Strict Mode remount — tránh race "script đã chèn nhưng chưa load".
let gsiPromise: Promise<GoogleApi | null> | null = null;
let credentialHandler: ((credential: string) => void) | null = null;

function ensureGsi(): Promise<GoogleApi | null> {
  if (gsiPromise) return gsiPromise;

  gsiPromise = new Promise((resolve) => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      resolve(null);
      return;
    }

    const init = () => {
      if (!window.google) {
        resolve(null);
        return;
      }
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: GoogleCredentialResponse) => {
          credentialHandler?.(response.credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // One Tap chỉ còn chạy qua FedCM trên Chrome; opt-out khiến Google trả lỗi
        // "The given origin is not allowed for the given client ID" dù origin đã đúng.
        use_fedcm_for_prompt: true,
        itp_support: true,
      });
      resolve(window.google);
    };

    if (window.google) {
      init();
      return;
    }

    let script = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = GSI_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init, { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
  });

  return gsiPromise;
}

/** Đăng ký handler đổi Google credential lấy token của app, dùng chung cho One Tap và button. */
function useGoogleCredentialLogin() {
  const router = useRouter();
  const { mutateAsync: getUserInfoByGoogle } = useGoogleLoginMutation();

  const handleSuccess = useCallback(
    async (idToken: string) => {
      const result = await getUserInfoByGoogle(idToken);
      const tokens = result?.data;
      if (!tokens) return;
      setToken(tokens.accessToken, tokens.refreshToken);
      router.push(ROUTES.ROOT);
    },
    [getUserInfoByGoogle, router],
  );

  useEffect(() => {
    credentialHandler = handleSuccess;
  }, [handleSuccess]);
}

/**
 * Hiện Google One Tap prompt. Mount một lần trong (auth) layout;
 * prompt lại khi điều hướng giữa các trang guest (layout không remount).
 */
export function useGoogleAuth() {
  const pathname = usePathname();
  useGoogleCredentialLogin();

  useEffect(() => {
    let cancelled = false;
    ensureGsi().then((google) => {
      if (cancelled || !google) return;
      google.accounts.id.prompt((notification) => {
        // Chỉ log ở dev để chẩn đoán One Tap (FedCM chỉ còn expose dismissed moment).
        if (process.env.NODE_ENV !== "development") return;
        if (notification.isDismissedMoment()) {
          console.info("[OneTap] dismissed:", notification.getDismissedReason());
        }
      });
    });

    return () => {
      cancelled = true;
      window.google?.accounts.id.cancel();
    };
  }, [pathname]);
}

/** Render nút "Sign in with Google" vào element được ref trỏ tới. */
export function useGoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  useGoogleCredentialLogin();

  useEffect(() => {
    let cancelled = false;
    ensureGsi().then((google) => {
      const btnEl = buttonRef.current;
      if (cancelled || !google || !btnEl) return;
      google.accounts.id.renderButton(btnEl, {
        theme: "outline",
        size: "large",
        width: btnEl.offsetWidth || 380,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return buttonRef;
}
