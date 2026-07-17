"use client";
import NotificationPanel from "@/features/notifications/components/organisms/notification-panel";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <div id="home-scroll" className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
      <div className="h-full">
        <NotificationPanel />
      </div>
    </div>
  );
}
