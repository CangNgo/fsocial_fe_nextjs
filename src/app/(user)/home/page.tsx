"use client";
import dynamic from "next/dynamic";

const HomeFeature = dynamic(
  () => import("@/features/home").then((m) => ({ default: m.HomeFeature })),
  { ssr: false },
);

export default function HomePage() {
  return <HomeFeature />;
}
