"use client";
import dynamic from "next/dynamic";

const AdminUserTable = dynamic(
  () => import("@/features/admin/presentation/pages/admin-user-table"),
  { ssr: false },
);

export default function UserManagementPage() {
  return <AdminUserTable />;
}
