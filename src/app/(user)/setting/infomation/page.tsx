"use client";
import dynamic from "next/dynamic";

const Infomation = dynamic(() => import("@/features/setting/pages/infomation"), { ssr: false });

export default function InfomationPage() {
  return <Infomation />;
}
