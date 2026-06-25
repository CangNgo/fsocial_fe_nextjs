// @ts-nocheck
"use client";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/components/ui/input-otp";

interface OtpInputGroupProps {
  value: string;
  setValue: (value: string) => void;
  autoFocus?: boolean;
}

export function OtpInputGroup({ value, setValue, autoFocus = false }: OtpInputGroupProps) {
  return (
    <InputOTP
      maxLength={4}
      pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
      value={value}
      onChange={setValue}
      autoFocus={autoFocus}
    >
      {[0, 1, 2, 3].map((index) => (
        <InputOTPGroup key={index} className="mx-1">
          <InputOTPSlot index={index} className="size-12 text-[18px]" />
        </InputOTPGroup>
      ))}
    </InputOTP>
  );
}
