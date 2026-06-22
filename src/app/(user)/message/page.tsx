"use client";
import dynamic from "next/dynamic";

const MessageFeature = dynamic(
  () => import("@/features/message").then((m) => ({ default: m.MessageFeature })),
  { ssr: false },
);

export default function MessagePage() {
  return <MessageFeature />;
}
