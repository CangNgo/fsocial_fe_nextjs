"use client";
import dynamic from "next/dynamic";

const FollowFeature = dynamic(() => import("@/features/follow/presentation/pages/follow-feature"), {
  ssr: false,
});

export default function FollowPage() {
  return <FollowFeature />;
}
