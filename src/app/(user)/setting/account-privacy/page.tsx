"use client";
import dynamic from "next/dynamic";

const AccountPrivacyForm = dynamic(
  () => import("@/features/setting").then((m) => ({ default: m.AccountPrivacyForm })),
  { ssr: false },
);

export default function AccountPrivacyPage() {
  return <AccountPrivacyForm />;
}
