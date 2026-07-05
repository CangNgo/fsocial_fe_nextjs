// hooks/useGoogleAuth.ts
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ROUTES } from "@/shared/config/routes";
import { getUserInfoByGoogle } from "../api/google-api";
import { setToken } from "./set-token";

interface GoogleCredentialResponse {
  credential: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: () => void;
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

export function useGoogleAuth() {
  const router = useRouter();
  const isGSIInitialized = useRef(false);

  const handleSuccess = useCallback(
    async (idToken: string) => {
      try {
        const result = await getUserInfoByGoogle(idToken);
        const tokens = result?.data;
        if (!tokens) return;
        setToken(tokens?.accessToken, tokens?.refreshToken);
        router.push(ROUTES.ROOT);
      } catch {
        return;
      }
    },
    [router],
  );

  const initGSI = useCallback(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!window.google || !googleClientId) return;
    if (isGSIInitialized.current) return;

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response: GoogleCredentialResponse) => {
        handleSuccess(response.credential);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: false,
    });

    window.google.accounts.id.prompt();
    console.log("url: ", window.location.href);

    const btnEl = document.getElementById("google-signin-btn");
    if (btnEl) {
      window.google.accounts.id.renderButton(btnEl, {
        theme: "outline",
        size: "large",
        width: btnEl.offsetWidth || 380,
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    }
  }, [handleSuccess]);

  useEffect(() => {
    if (window.google) {
      initGSI();
      return;
    }

    const scriptId = "google-gsi-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGSI;
      document.head.appendChild(script);
    }

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [initGSI]);
}
