"use client";
import dynamic from "next/dynamic";

const AdminReportsDashboard = dynamic(
  () => import("@/features/admin").then((m) => ({ default: m.AdminReportsDashboard })),
  { ssr: false },
);

export default function ReportsPage() {
  return <AdminReportsDashboard />;
}
