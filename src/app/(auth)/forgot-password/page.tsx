"use client";
import dynamic from "next/dynamic";

const ForgotPasswordForm = dynamic(
  () => import("@/features/auth/presentation/pages/forgot-password-form"),
  { ssr: false },
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
