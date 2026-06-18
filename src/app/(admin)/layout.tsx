"use client";
import { jwtDecode } from "jwt-decode";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/organisms/AdminSidebar";
import { GlobalPopup } from "@/components/organisms/GlobalPopup";
import { getAdminProfile } from "@/lib/api/admin/adminProfileApi";
import { adminStore } from "@/store/adminStore";
import { getCookie } from "@/utils/cookie";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { setUser } = adminStore();

  useEffect(() => {
    const token = getCookie("access-token");
    if (!token) return;
    try {
      const decoded = jwtDecode<{ sub: string }>(token);
      getAdminProfile(decoded.sub).then((profile) => {
        if (profile) setUser(profile as Parameters<typeof setUser>[0]);
      });
    } catch {}
  }, [setUser]);

  return (
    <div className="flex min-h-screen p-4 gap-4">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
      <GlobalPopup />
    </div>
  );
}
