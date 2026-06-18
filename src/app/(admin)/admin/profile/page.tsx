"use client";
import dynamic from "next/dynamic";

const AdminProfileEditor = dynamic(
  () => import("@/features/admin").then((m) => ({ default: m.AdminProfileEditor })),
  { ssr: false },
);

export default function AdminProfilePage() {
  return <AdminProfileEditor />;
}
