"use client";
import { useOwnerProfile } from "@/features/profile/hooks/use-profile";
import { ExpiredDialog } from "@/shared/components/organisms/expired-dialog";
import { GlobalPopup } from "@/shared/components/organisms/global-popup";
import { Header } from "@/shared/components/organisms/header";
import { Sidebar } from "@/shared/components/organisms/sidebar";
import { ROUTES } from "@/shared/config/routes";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
// Tạm comment kết nối websocket
// import { useMessageStore } from "@/shared/stores/message-store";
// import { useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { getCookie } from "@/shared/utils/cookie";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = ownerAccountStore();
  const { refreshToken } = validRefreshTokenStore();
  const initialized = useRef(false);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const hasToken = mounted && !!getCookie("access-token");
  const { data: res } = useOwnerProfile(hasToken);

  useEffect(() => {
    if (!hasToken || !res) return;

    if (res.statusCode !== 200) {
      toast.error("Lỗi khi tải thông tin cá nhân của bạn");
      router.push(ROUTES.LOGIN);
      return;
    }
    if (!res.data) return;

    setUser({ ...res.data });

    if (!initialized.current) {
      initialized.current = true;
    }
  }, [hasToken, res, setUser, router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Center — only this column scrolls */}
      <main
        id="main-scroll"
        className="flex-1 overflow-y-auto overflow-x-hidden min-w-0"
        style={{ backgroundColor: "var(--lower-background-clr)" }}
      >
        {/* Mobile header (sm:hidden) — fixed relative to viewport, not this scroll container */}
        <Header />
        {children}
      </main>

      <GlobalPopup />
      <ExpiredDialog open={mounted && !refreshToken} />
    </div>
  );
}
