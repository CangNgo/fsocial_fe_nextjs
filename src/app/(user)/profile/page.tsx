"use client";
import dynamic from "next/dynamic";

const ProfileFeature = dynamic(
  () => import("@/features/profile/presentation/pages/profile-feature"),
  { ssr: false },
);

export default function ProfilePage() {
  return <ProfileFeature />;
}
