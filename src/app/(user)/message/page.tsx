"use client";
import dynamic from "next/dynamic";

const MessageFeature = dynamic(
  () => import("@/features/message/components/pages/message-feature"),
  { ssr: false },
);

export default function MessagePage() {
  return <MessageFeature />;
}
