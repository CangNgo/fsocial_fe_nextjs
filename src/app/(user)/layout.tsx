"use client";
import { jwtDecode } from "jwt-decode";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { getOwnerProfile } from "@/features/profile/api/profile-api";
import { ExpiredDialog } from "@/shared/components/organisms/expired-dialog/expired-dialog";
import { GlobalPopup } from "@/shared/components/organisms/global-popup/global-popup";
import { Header } from "@/shared/components/organisms/header/header";
import { Sidebar } from "@/shared/components/organisms/sidebar/sidebar";
import { useMessageStore } from "@/shared/stores/message-store";
import { useNotificationStore } from "@/shared/stores/notification-store";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { validRefreshTokenStore } from "@/shared/stores/valid-refresh-token-store";
import { getCookie } from "@/shared/utils/cookie";

const NotificationPanel = dynamic(
  () => import("@/shared/components/organisms/notification-panel/notification-panel"),
  { ssr: false },
);

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = ownerAccountStore();
  const { connectNotificationWebSocket } = useNotificationStore();
  const { connectMessageWebSocket } = useMessageStore();
  const { refreshToken } = validRefreshTokenStore();
  const initialized = useRef(false);

  // Prevent hydration mismatch: validRefreshTokenStore reads cookies (window-only),
  // so server renders refreshToken=null while client may have a real value.
  // Only render the ExpiredDialog after the client has hydrated.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const token = getCookie("access-token");
    if (!token) return;
    let userId: string | null = null;
    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      userId = decoded.sub;
    } catch {
      return;
    }
    if (!userId) return;

    // Set userId immediately so HomeFeature/other pages can start fetching
    // without waiting for the full profile response.
    setUser({ userId });

    // Load full profile details (name, avatar, etc.) asynchronously
    getOwnerProfile().then((profile: unknown) => {
      const p = profile as { statusCode?: number; data?: Parameters<typeof setUser>[0] } | null;
      if (p?.statusCode === 200 && p?.data) setUser(p.data);
    });

    if (!initialized.current) {
      initialized.current = true;
      connectNotificationWebSocket(userId);
      connectMessageWebSocket(userId);
    }
  }, [
    // Set userId immediately so HomeFeature/other pages can start fetching
    // without waiting for the full profile response.
    setUser,
    connectNotificationWebSocket,
    connectMessageWebSocket,
  ]);

  return (
    /*
      Root: h-screen + overflow-hidden → toàn bộ trang không scroll theo window
      Sidebar trái: sticky, không scroll
      Main giữa: overflow-y-auto → chỉ vùng này scroll
      Right (sau): sẽ thêm panel thông báo, tự scroll riêng
    */
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
    </div>
  );
}
