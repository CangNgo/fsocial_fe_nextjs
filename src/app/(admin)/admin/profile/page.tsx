"use client";
import dynamic from "next/dynamic";

const AdminProfileEditor = dynamic(
  () => import("@/features/admin/components/pages/admin-profile-editor"),
  { ssr: false },
);

export default function AdminProfilePage() {
  return <AdminProfileEditor />;
}
