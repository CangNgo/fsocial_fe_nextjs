"use client";
import dynamic from "next/dynamic";

const AdminPolicyEditor = dynamic(
  () => import("@/features/admin").then((m) => ({ default: m.AdminPolicyEditor })),
  { ssr: false },
);

export default function PolicySettingPage() {
  return <AdminPolicyEditor />;
}
