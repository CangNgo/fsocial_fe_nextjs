"use client";
import dynamic from "next/dynamic";

const AdminPolicyEditor = dynamic(
  () => import("@/features/admin/components/pages/admin-policy-editor"),
  { ssr: false },
);

export default function PolicySettingPage() {
  return <AdminPolicyEditor />;
}
