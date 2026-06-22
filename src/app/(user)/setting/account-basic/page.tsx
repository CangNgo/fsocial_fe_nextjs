"use client";
import dynamic from "next/dynamic";

const AccountBasicForm = dynamic(
  () => import("@/features/setting").then((m) => ({ default: m.AccountBasicForm })),
  { ssr: false },
);

export default function AccountBasicPage() {
  return <AccountBasicForm />;
}
