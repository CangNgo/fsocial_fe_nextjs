"use client";
import dynamic from "next/dynamic";

const FollowFeature = dynamic(
  () => import("@/features/follow").then((m) => ({ default: m.FollowFeature })),
  { ssr: false },
);

export default function FollowPage() {
  return <FollowFeature />;
}
