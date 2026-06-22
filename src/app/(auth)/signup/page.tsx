"use client";
import dynamic from "next/dynamic";

const SignupForm = dynamic(
  () => import("@/features/auth").then((m) => ({ default: m.SignupForm })),
  { ssr: false },
);

export default function SignupPage() {
  return <SignupForm />;
}
