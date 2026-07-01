"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { requestOTP, resetPassword, validOTP } from "../api/forgot-password-api";
import type {
  ForgotPasswordApiResponse,
  ForgotPasswordStep1FormData,
  ForgotPasswordStep2FormData,
} from "../types/forgot-password";
import { useOtpCooldown } from "./use-otp-cooldown";
import { useStepCarousel } from "./use-step-carousel";

const TOTAL_STEPS = 3;

export function useForgotPassword() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const carousel = useStepCarousel(currentStep, TOTAL_STEPS);

  const step1Form = useForm<ForgotPasswordStep1FormData>({ mode: "all" });
  const {
    formState: { isValid: isValidStep1 },
    getValues: getValuesStep1,
  } = step1Form;

  const [otpValue, setOtpValue] = useState("");
  const [otpErrMessage, setOtpErrMessage] = useState("");
  const [validOTPClicked, setValidOTPClicked] = useState(false);

  const { disableResendOTP, cooldownSeconds, startCooldown } = useOtpCooldown(isValidStep1);

  const handleRequireOTP = () => {
    if (!startCooldown()) return;

    requestOTP({
      email: getValuesStep1("email"),
      type: "RESET",
    });
  };

  const handleSubmitOTP = async () => {
    if (otpValue === "") {
      setOtpErrMessage("MÃ£ OTP khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng");
      return;
    }
    setOtpErrMessage("");
    setValidOTPClicked(true);

    const resp = (await validOTP({
      email: getValuesStep1("email"),
      otp: otpValue,
      type: "RESET",
    })) as ForgotPasswordApiResponse;

    setValidOTPClicked(false);

    if (resp?.statusCode === 200) {
      setCurrentStep(2);
    } else {
      setOtpErrMessage(resp?.message ?? "MÃ£ OTP khÃ´ng há»£p lá»‡");
    }
  };

  const backToStep1 = () => setCurrentStep(1);

  const [step2Err, setStep2Err] = useState("");
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowRePassword, setIsShowRePassword] = useState(false);
  const [step2Submitting, setStep2Submitting] = useState(false);

  const step2Form = useForm<ForgotPasswordStep2FormData>({ mode: "all" });
  const {
    formState: { isValid: isValidStep2 },
    getValues: getValuesStep2,
    watch: watchStep2,
  } = step2Form;

  const password = watchStep2("password");

  const handleStep2 = async () => {
    if (!isValidStep2) return;
    setStep2Submitting(true);

    const resp = (await resetPassword({
      email: getValuesStep1("email"),
      newPassword: getValuesStep2("password"),
    })) as ForgotPasswordApiResponse;

    setStep2Submitting(false);

    if (resp?.statusCode === 200) {
      setCurrentStep(3);
      toast.success("Äá»•i máº­t kháº©u thÃ nh cÃ´ng, Ä‘ang chuyá»ƒn hÆ°á»›ng...");
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } else {
      setStep2Err(resp?.message ?? "ÄÃ£ cÃ³ lá»—i xáº£y ra trong quÃ¡ trÃ¬nh reset máº­t kháº©u");
    }
  };

  const stepCircleClass = (step: number) =>
    currentStep >= step
      ? "bg-gradient-to-r from-pink-500 to-orange-400 text-white"
      : "bg-secondary text-foreground";

  const connectorClass = (threshold: number) =>
    `col-span-2 relative h-[1px] bg-gradient-to-r from-transparent from-50% to-muted to-50% bg-[length:20px_100%]
     before:absolute before:left-0 before:h-full ${
       currentStep >= threshold ? "before:w-full" : "before:w-0"
} before:bg-gradient-to-r before:from-transparent before:from-50% before:to-pink-500 before:to-50% before:bg-[length:20px_100%]
     before:transition-all before:duration-700 before:ease-out`;

  return {
    currentStep,
    ...carousel,
    step1Form,
    otpValue,
    setOtpValue,
    otpErrMessage,
    validOTPClicked,
    disableResendOTP,
    cooldownSeconds,
    handleRequireOTP,
    handleSubmitOTP,
    backToStep1,
    step2Form,
    password,
    isValidStep2,
    step2Err,
    isShowPassword,
    setIsShowPassword,
    isShowRePassword,
    setIsShowRePassword,
    step2Submitting,
    handleStep2,
    stepCircleClass,
    connectorClass,
  };
}
