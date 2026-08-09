"use client";
import dynamic from "next/dynamic";

const AccountLoginForm = dynamic(
  () => import("@/features/setting/pages/account-login-form"),
  { ssr: false },
);

export default function AccountLoginPage() {
  return <AccountLoginForm />;
}
