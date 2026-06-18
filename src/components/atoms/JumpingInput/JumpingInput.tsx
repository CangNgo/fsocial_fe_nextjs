"use client";
import { type RefObject, useEffect } from "react";
import type { FieldErrors, RegisterOptions, UseFormRegister } from "react-hook-form";
import { cn } from "@/lib/utils";

interface SelectProps {
  register: UseFormRegister<Record<string, unknown>>;
  errors?: FieldErrors<Record<string, unknown>>;
  label: string;
  name: string;
  validateOptions?: RegisterOptions;
  options?: Record<string | number, string | number>;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Select({
  register,
  errors,
  label,
  name,
  validateOptions = {},
  options = {},
  icon,
  disabled = false,
  className,
}: SelectProps) {
  return (
    <label className={cn("block", disabled && "pointer-events-none opacity-65", className)}>
      <span className="block mb-2 font-medium">{label}</span>
      <div className="relative">
        <select
          className={cn(
            "peer appearance-none custom-input cursor-pointer",
            errors?.[name] && "custom-input-error",
          )}
          {...register(name as never, validateOptions)}
        >
          {Object.entries(options).map(([key, val]) => (
            <option key={key} value={key} className="bg-background">
              {String(val)}
            </option>
          ))}
        </select>
        <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2">{icon}</div>
      </div>
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{String(errors[name]?.message ?? "")}</p>
      )}
    </label>
  );
}

export function JumpingSelect({
  register,
  errors,
  label,
  name,
  validateOptions = {},
  options = {},
  icon,
  disabled = false,
  className,
}: SelectProps) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-65", className)}>
      <div className="relative">
        <select
          className={cn(
            "peer appearance-none custom-input cursor-pointer",
            errors?.[name] && "custom-input-error",
            disabled && "pointer-events-none",
          )}
          tabIndex={disabled ? -1 : 0}
          {...register(name as never, validateOptions)}
        >
          {Object.entries(options).map(([key, val]) => (
            <option key={key} value={key} className="bg-background">
              {String(val)}
            </option>
          ))}
        </select>
        <span
          className={cn(
            "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 transition",
            errors?.[name]
              ? "text-red-500"
              : "peer-hover:text-foreground peer-focus:text-foreground",
          )}
        >
          {label}
        </span>
        <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
      </div>
      {errors?.[name] && (
        <p className="text-red-500 text-sm mt-1">{String(errors[name]?.message ?? "")}</p>
      )}
    </div>
  );
}

interface TextBoxProps {
  texboxRef: RefObject<HTMLDivElement | null>;
  label?: string;
  placeholder?: string;
  innerHTML?: string;
  contentEditable?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onInput?: () => void;
  autoFocus?: boolean;
  trigger?: boolean;
  className?: string;
  parentClassName?: string;
}

export function TextBox({
  texboxRef,
  label,
  placeholder,
  innerHTML,
  contentEditable = true,
  onKeyDown = () => {},
  onInput = () => {},
  autoFocus = false,
  trigger = false,
  className,
  parentClassName,
}: TextBoxProps) {
  const onAutoInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.innerHTML === "<br>") target.innerHTML = "";
    onInput();
  };

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (!texboxRef.current) return;
        texboxRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        if (texboxRef.current.lastChild) {
          range.setStartAfter(texboxRef.current.lastChild);
          range.collapse(true);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }, 200);
    }
  }, [texboxRef.current, autoFocus]);

  return (
    <div className={cn("w-full", parentClassName)}>
      {label && <span className="block mb-2 font-medium">{label}</span>}
      {/* biome-ignore lint/a11y/useSemanticElements: contentEditable rich-text box renders HTML content and cannot be a native input/textarea */}
      <div
        ref={texboxRef}
        role="textbox"
        tabIndex={0}
        className={cn(
          "text-base relative w-full outline-none overflow-auto scroll-pb-2",
          "before:absolute before:ps-0.5 empty:before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none transition",
          className,
        )}
        contentEditable={contentEditable}
        data-placeholder={placeholder}
        onKeyDown={onKeyDown}
        onInput={onAutoInput}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: renders pre-sanitized formatted text
        dangerouslySetInnerHTML={{ __html: innerHTML ?? "" }}
      />
    </div>
  );
}
