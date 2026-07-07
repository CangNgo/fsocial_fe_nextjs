"use client";
import { useAdminProfile } from "@/features/admin/hooks/queries/use-admin-profile";
import { AdminSidebar } from "@/shared/components/organisms/admin-sidebar";
import { GlobalPopup } from "@/shared/components/organisms/global-popup";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAdminProfile();

  return (
    <div className="flex min-h-screen p-4 gap-4">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
      <GlobalPopup />
    </div>
  );
}
