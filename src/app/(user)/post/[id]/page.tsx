"use client";
import dynamic from "next/dynamic";

const PostFeature = dynamic(() => import("@/features/post/components/pages/post-feature"), {
  ssr: false,
});

export default function PostDetailPage() {
  return <PostFeature />;
}
