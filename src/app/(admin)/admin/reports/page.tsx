"use client";
import dynamic from "next/dynamic";

const AdminReportsDashboard = dynamic(
  () => import("@/features/admin/presentation/pages/admin-reports-dashboard"),
  { ssr: false },
);

export default function ReportsPage() {
  return <AdminReportsDashboard />;
}
