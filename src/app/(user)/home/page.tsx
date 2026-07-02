"use client";
import dynamic from "next/dynamic";

const Timeline = dynamic(() => import("@/features/home/components/pages/timeline"), {
  ssr: false,
});

const HomePage = () => {
  return <Timeline />;
};

export default HomePage;
