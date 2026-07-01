"use client";
import dynamic from "next/dynamic";

const SignupForm = dynamic(() => import("@/features/auth/components/pages/signup-form"), {
  ssr: false,
});

export default function SignupPage() {
  return <SignupForm />;
}
