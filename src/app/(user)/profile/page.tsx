"use client";
import dynamic from "next/dynamic";

const ProfileFeature = dynamic(
  () => import("@/features/profile/ProfileFeature").then((m) => ({ default: m.ProfileFeature })),
  { ssr: false },
);

export default function ProfilePage() {
  return <ProfileFeature />;
}
