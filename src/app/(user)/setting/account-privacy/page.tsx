"use client";
import dynamic from "next/dynamic";

const AccountPrivacyForm = dynamic(
  () => import("@/features/setting/presentation/pages/account-privacy-form"),
  { ssr: false },
);

export default function AccountPrivacyPage() {
  return <AccountPrivacyForm />;
}
