"use client";
import dynamic from "next/dynamic";

const AdminFaqManagementPage = dynamic(
  () => import("@/features/admin/components/pages/admin-faq-management-page"),
  { ssr: false },
);

export default function FaqsPage() {
  return <AdminFaqManagementPage />;
}
