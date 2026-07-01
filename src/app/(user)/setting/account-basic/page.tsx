"use client";
import dynamic from "next/dynamic";

const AccountBasicForm = dynamic(
  () => import("@/features/setting/components/pages/account-basic-form"),
  { ssr: false },
);

export default function AccountBasicPage() {
  return <AccountBasicForm />;
}
