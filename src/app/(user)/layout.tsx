"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "sonner";
import { getOwnerProfile } from "@/features/profile/api/profile-api";
import { ExpiredDialog } from "@/shared/components/organisms/expired-dialog";
import { GlobalPopup } from "@/shared/components/organisms/global-popup";
import { Header } from "@/shared/components/organisms/header";
import { Sidebar } from "@/shared/components/organisms/sidebar";
import { ROUTES } from "@/shared/config/routes";
// Tạm comment kết nối websocket
// import { useMessageStore } from "@/shared/stores/message-store";
// import { useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { getCookie } from "@/shared/utils/cookie";

const NotificationPanel = dynamic(
  () => import("@/shared/components/organisms/notification-panel"),
  { ssr: false },
);

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = ownerAccountStore();
  const { refreshToken } = validRefreshTokenStore();
  const initialized = useRef(false);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleGetProfile = async () => {
    const res = await getOwnerProfile();
    if (res?.statusCode != 200) {
      toast.error("Lỗi khi tải thông tin cá nhân của bạn");
      router.push(ROUTES.LOGIN);
      return;
    } else {
      return res.data;
    }
  };

  useEffect(() => {
    const token = getCookie("access-token");
    if (!token) return;

    const fetchProfile = async () => {
      const profile = await handleGetProfile();
      if (!profile) return;

      setUser({ ...profile });

      if (!initialized.current) {
        initialized.current = true;
        // Tạm comment kết nối websocket
        // connectNotificationWebSocket(userId);
        // connectMessageWebSocket(userId);
      }
    };

    fetchProfile();
  }, [setUser]);

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

      {/* Right panel placeholder — sẽ thêm NotificationPanel vào đây sau */}
      <NotificationPanel />

      <GlobalPopup />
      <ExpiredDialog open={mounted && !refreshToken} />
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
