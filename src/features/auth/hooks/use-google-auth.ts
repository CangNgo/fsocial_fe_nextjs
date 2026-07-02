// hooks/useGoogleAuth.ts
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ROUTES } from "@/shared/config/routes";
import { getUserInfoByGoogle } from "../api/google-api";
import { setToken } from "./set-token";

declare global {
  interface Window {
    google: any;
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
      } catch (error) {
        console.error("Google login error:", error);
      }
    },
    [router],
  );

  const initGSI = useCallback(() => {
    if (!window.google) return;
    if (isGSIInitialized.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response: { credential: string }) => {
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
