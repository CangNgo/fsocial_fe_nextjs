"use client";
import type React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface TabItem {
  label: string;
  icon?: React.ReactNode;
}

interface TabPanelProps {
  tabs: TabItem[];
  currentTab: number;
  onTabChange: (index: number) => void;
  className?: string;
  isOwner?: boolean;
  ownerOnlyLastN?: number;
}

export function TabPanel({
  tabs,
  currentTab,
  onTabChange,
  className,
  isOwner = true,
  ownerOnlyLastN = 0,
}: TabPanelProps) {
  const visibleTabs =
    !isOwner && ownerOnlyLastN > 0 ? tabs.slice(0, tabs.length - ownerOnlyLastN) : tabs;

  return (
    <div className={cn("border-t flex bg-background transition", className)}>
      {visibleTabs.map((tab, index) => (
        <Button
          type="button"
          key={tab.label}
          className={cn(
            "flex-grow flex items-center justify-center gap-1 border-t px-1 sm:py-1 py-3",
            currentTab === index
              ? "text-primary-text fill-primary-text stroke-primary-text border-primary-text"
              : "text-gray fill-gray stroke-gray border-background",
          )}
          onClick={() => onTabChange(index)}
        >
          {tab.icon}
          <span className="sm:inline hidden">{tab.label}</span>
        </Button>
      ))}
    </div>
  );
}
