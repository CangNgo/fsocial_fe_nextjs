"use client";
import { useAdminProfile } from "@/features/admin/hooks/queries/use-admin-profile";
import { AdminSidebar } from "@/shared/components/organisms/admin-sidebar";
import { GlobalPopup } from "@/shared/components/organisms/global-popup";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAdminProfile();

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0">{children}</main>
      <GlobalPopup />
    </div>
  );
}
