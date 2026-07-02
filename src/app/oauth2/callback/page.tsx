"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ROUTES } from "@/shared/config/routes";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { setCookie } from "@/shared/utils/cookie";

function OAuth2CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setRefreshToken } = validRefreshTokenStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");

    if (token && refreshToken) {
      setCookie("access-token", token, 360 * 10);
      setCookie("refresh-token", refreshToken, 360 * 10);
      setRefreshToken(refreshToken);
      setTimeout(() => router.replace(ROUTES.HOME), 2000);
    } else {
      router.replace(`${ROUTES.LOGIN}?error=oauth2_failed`);
    }
  }, [setRefreshToken, searchParams.get, router.replace]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function OAuth2CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <p>Đang tải...</p>
        </div>
      }
    >
      <OAuth2CallbackInner />
    </Suspense>
  );
}
