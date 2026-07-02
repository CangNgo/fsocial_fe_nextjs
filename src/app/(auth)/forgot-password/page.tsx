"use client";
import dynamic from "next/dynamic";

const ForgotPasswordForm = dynamic(
  () => import("@/features/auth/components/pages/forgot-password-form"),
  { ssr: false },
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
