import { LoaderCircle } from "lucide-react";

interface LoadingProps {
  className?: string;
}

export function Loading({ className }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <LoaderCircle className="animate-spin text-base" />
    </div>
  );
}
