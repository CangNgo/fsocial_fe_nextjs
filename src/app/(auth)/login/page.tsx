"use client";
import dynamic from "next/dynamic";

const LoginForm = dynamic(() => import("@/features/auth").then((m) => ({ default: m.LoginForm })), {
  ssr: false,
});

export default function LoginPage() {
  return <LoginForm />;
}
