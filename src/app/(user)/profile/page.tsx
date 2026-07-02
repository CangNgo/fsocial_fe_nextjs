"use client";
import dynamic from "next/dynamic";

const ProfilePage = dynamic(() => import("@/features/profile/components/pages/profile-feature"), {
  ssr: false,
});

export default function Profile() {
  return <ProfilePage />;
}
