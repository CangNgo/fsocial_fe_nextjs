"use client";
import dynamic from "next/dynamic";
import { TimelineSkeleton } from "@/features/home";

const Timeline = dynamic(() => import("@/features/home/components/pages/timeline"), {
  ssr: false,
  loading: () => <TimelineSkeleton />,
});

const HomePage = () => {
  return <Timeline />;
};

export default HomePage;
