"use client";
import dynamic from "next/dynamic";

const SignupForm = dynamic(() => import("@/features/auth/presentation/pages/signup-form"), {
  ssr: false,
});

export default function SignupPage() {
  return <SignupForm />;
}
