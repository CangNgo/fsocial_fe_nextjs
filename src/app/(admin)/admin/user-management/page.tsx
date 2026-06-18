"use client";
import dynamic from "next/dynamic";

const AdminUserTable = dynamic(
  () => import("@/features/admin").then((m) => ({ default: m.AdminUserTable })),
  { ssr: false },
);

export default function UserManagementPage() {
  return <AdminUserTable />;
}
