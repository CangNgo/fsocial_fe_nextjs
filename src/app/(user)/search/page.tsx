"use client";
import dynamic from "next/dynamic";

const SearchFeature = dynamic(() => import("@/features/search/components/pages/search-feature"), {
  ssr: false,
});

export default function SearchPage() {
  return <SearchFeature />;
}
