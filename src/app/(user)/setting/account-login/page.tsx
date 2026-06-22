"use client";
import dynamic from "next/dynamic";

const AccountLoginForm = dynamic(
  () => import("@/features/setting").then((m) => ({ default: m.AccountLoginForm })),
  { ssr: false },
);

export default function AccountLoginPage() {
  return <AccountLoginForm />;
}
