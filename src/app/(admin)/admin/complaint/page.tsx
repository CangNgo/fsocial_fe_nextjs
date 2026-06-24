"use client";
import dynamic from "next/dynamic";

const AdminComplaintPanel = dynamic(
  () => import("@/features/admin/presentation/pages/admin-complaint-panel"),
  { ssr: false },
);

export default function ComplaintPage() {
  return <AdminComplaintPanel />;
}
