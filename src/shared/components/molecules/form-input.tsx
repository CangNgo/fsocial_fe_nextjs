"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { forwardRef, useId, useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type LabelPosition = "top" | "horizontal";

interface FormInputProps extends Omit<ComponentProps<"input">, "size"> {
  label?: ReactNode;
  labelPosition?: LabelPosition;
  error?: string;
  icon?: ReactNode;
  onIconClick?: () => void;
  wrapperClassName?: string;
  labelClassName?: string;
  inputWrapperClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  {
    label,
    labelPosition = "top",
    error,
    icon,
    onIconClick,
    type = "text",
    className,
    wrapperClassName,
    labelClassName,
    inputWrapperClassName,
    id,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField = type === "password";
  const resolvedType = isPasswordField ? (isPasswordVisible ? "text" : "password") : type;
  const resolvedIcon = isPasswordField ? (
    isPasswordVisible ? (
      <EyeOff className="size-5" />
    ) : (
      <Eye className="size-5" />
    )
  ) : (
    icon
  );
  const resolvedIconClick = isPasswordField
    ? () => setIsPasswordVisible((prev) => !prev)
    : onIconClick;

  return (
    <div
      className={cn(
        "w-full",
        labelPosition === "horizontal" && "flex items-center gap-3",
        wrapperClassName,
      )}
    >
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "font-medium",
            labelPosition === "top" && "block mb-2",
            labelPosition === "horizontal" && "shrink-0",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}
      <div className={cn("w-full", inputWrapperClassName)}>
        <div className="relative">
          <Input
            ref={ref}
            id={inputId}
            type={resolvedType}
            aria-invalid={!!error}
            className={cn(resolvedIcon && "pr-10", className)}
            {...props}
          />
          {resolvedIcon &&
            (resolvedIconClick ? (
              <button
                type="button"
                tabIndex={-1}
                onClick={resolvedIconClick}
                className={cn(
                  "absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground",
                  error && "text-destructive",
                )}
              >
                {resolvedIcon}
              </button>
            ) : (
              <span
                className={cn(
                  "absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-muted-foreground",
                  error && "text-destructive",
                )}
              >
                {resolvedIcon}
              </span>
            ))}
        </div>
        {error && <p className="text-destructive text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
});
