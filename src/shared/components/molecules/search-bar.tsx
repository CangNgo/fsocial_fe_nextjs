"use client";
import { SearchIcon } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <div className="relative size-full">
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="size-full rounded-lg pl-8"
      />
      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <SearchIcon className="size-[18px] text-muted-foreground" />
      </div>
    </div>
  );
}
