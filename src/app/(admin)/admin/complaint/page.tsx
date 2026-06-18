"use client";
import dynamic from "next/dynamic";

const AdminComplaintPanel = dynamic(
  () => import("@/features/admin").then((m) => ({ default: m.AdminComplaintPanel })),
  { ssr: false },
);

export default function ComplaintPage() {
  return <AdminComplaintPanel />;
}
