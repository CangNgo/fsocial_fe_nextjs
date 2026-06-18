"use client";
import dynamic from "next/dynamic";

const SearchFeature = dynamic(
  () => import("@/features/search").then((m) => ({ default: m.SearchFeature })),
  { ssr: false },
);

export default function SearchPage() {
  return <SearchFeature />;
}
