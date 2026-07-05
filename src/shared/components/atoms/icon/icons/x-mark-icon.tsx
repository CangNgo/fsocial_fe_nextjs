import { X } from "lucide-react";
import type { ComponentProps } from "react";

type XMarkIconProps = ComponentProps<typeof X>;

export const XMarkIcon = ({ className, ...props }: XMarkIconProps) => (
  <X className={className} strokeWidth={2} {...props} />
);
