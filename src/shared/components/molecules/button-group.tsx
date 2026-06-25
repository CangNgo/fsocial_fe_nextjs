"use client";
import type React from "react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ButtonGroupProps {
  items: React.ReactNode[];
  onClick?: (index: number) => void;
}

export function ButtonGroup({ items, onClick }: ButtonGroupProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleClick = (index: number) => {
    setActiveIndex(index);
    onClick?.(index);
  };

  return (
    <div className="inline-flex rounded-lg shadow-b overflow-hidden border border-gray-2light">
      {items.map((item, index) => (
        <Button
          key={String(item)}
          type="button"
          variant="ghost"
          onClick={() => handleClick(index)}
          className={cn(
            "btn-transparent rounded-none px-4 text-nowrap text-sm font-medium border-l border-gray-2light transition",
            index === 0 && "border-l-0",
            activeIndex === index ? "bg-secondary" : "!text-gray",
          )}
        >
          {item}
        </Button>
      ))}
    </div>
  );
}
