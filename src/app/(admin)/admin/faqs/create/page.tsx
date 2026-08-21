"use client";
import dynamic from "next/dynamic";

const AdminFaqFormPage = dynamic(
  () => import("@/features/admin/components/pages/admin-faq-form-page"),
  { ssr: false },
);

export default function CreateFaqPage() {
  return <AdminFaqFormPage />;
}
