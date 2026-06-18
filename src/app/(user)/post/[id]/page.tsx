"use client";
import dynamic from "next/dynamic";

const PostFeature = dynamic(
  () => import("@/features/post").then((m) => ({ default: m.PostFeature })),
  { ssr: false },
);

export default function PostDetailPage() {
  return <PostFeature />;
}
