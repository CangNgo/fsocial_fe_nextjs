"use client";
import dynamic from "next/dynamic";

const AdminComplaintPanel = dynamic(
  () => import("@/features/admin/components/pages/admin-complaint-panel"),
  { ssr: false },
);

export default function ComplaintPage() {
  return <AdminComplaintPanel />;
}
