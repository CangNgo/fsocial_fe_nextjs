"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ROUTES } from "@/shared/config/routes";
import { checkDuplicate, requestOTP, sendingCreateAccount, validOTP } from "../api/signup-api";
import { signupStep1Schema, signupStep2Schema } from "../schemas/signup-schema";
import type { SignupApiResponse, SignupStep1FormData, SignupStep2FormData } from "../types/signup";
import { removeVietnameseAccents } from "../utils/remove-special-word";
import { useStepCarousel } from "./use-step-carousel";

const TOTAL_STEPS = 4;

export function useSignupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const carousel = useStepCarousel(currentStep, TOTAL_STEPS);

  const step1Form = useForm<SignupStep1FormData>({
    mode: "all",
    resolver: zodResolver(signupStep1Schema),
  });
  const {
    trigger: triggerValidStep1,
    formState: { isValid: isValidStep1 },
    getValues: getValuesStep1,
  } = step1Form;

  const step2Form = useForm<SignupStep2FormData>({
    mode: "all",
    resolver: zodResolver(signupStep2Schema),
  });
  const {
    trigger: triggerValidateStep2,
    formState: { isValid: isValidStep2 },
    setError: setErrorStep2,
    setValue: setValueStep2,
    getValues: getValuesStep2,
  } = step2Form;

  const [checkDuplicateClicked, setCheckDuplicateClicked] = useState(false);
  const [step2Err, setStep2Err] = useState("");

  const [otpValue, setOtpValue] = useState("");
  const [validOTPClicked, setValidOTPClicked] = useState(false);
  const [step3Err, setStep3Err] = useState("");

  const handleStep1 = async () => {
    await triggerValidStep1();
    if (!isValidStep1) return;

    const data = getValuesStep1();
    setValueStep2(
      "username",
      removeVietnameseAccents(data.firstName) +
        removeVietnameseAccents(data.lastName) +
        (Math.floor(Math.random() * 9000) + 10000),
    );
    setCurrentStep(2);
  };

  const backToStep1 = () => setCurrentStep(1);

  const handleStep2 = async () => {
    setStep2Err("");
    await triggerValidateStep2();
    if (!isValidStep2) return;

    const data = getValuesStep2();
    setCheckDuplicateClicked(true);
    const duplicateResp = (await checkDuplicate(data.username)) as SignupApiResponse | null;
    setCheckDuplicateClicked(false);

    if (!duplicateResp || duplicateResp.statusCode !== 200) {
      if (duplicateResp?.data?.username) {
        setErrorStep2("username", { message: duplicateResp.data.username });
      }
      if (duplicateResp?.data?.email) {
        setErrorStep2("email", { message: duplicateResp.data.email });
      }
      setStep2Err(duplicateResp?.message ?? "Kiểm tra thông tin thất bại");
      return;
    }

    const otpResp = (await requestOTP(data.email)) as SignupApiResponse | null;
    if (!otpResp || otpResp.statusCode !== 200) {
      setStep2Err(otpResp?.message ?? "Gửi OTP thất bại");
      return;
    }

    setCurrentStep(3);
  };

  const backToStep2 = () => setCurrentStep(2);

  const handleStep3 = async () => {
    setStep3Err("");
    if (otpValue.length !== 4) {
      setStep3Err("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    setValidOTPClicked(true);
    const otpResp = (await validOTP(otpValue)) as SignupApiResponse | null;
    if (!otpResp || otpResp.statusCode !== 200) {
      setValidOTPClicked(false);
      setStep3Err(otpResp?.message ?? "Xác minh OTP thất bại");
      return;
    }

    const data1 = getValuesStep1();
    const data2 = getValuesStep2();
    const createResp = (await sendingCreateAccount({
      ...data1,
      ...data2,
    })) as SignupApiResponse | null;

    setValidOTPClicked(false);
    if (!createResp || createResp.statusCode !== 200) {
      setStep3Err(createResp?.message ?? "Tạo tài khoản thất bại");
      return;
    }

    setCurrentStep(4);
    toast.success("Tạo tài khoản thành công");
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 1500);
  };

  const handleGoogleSignup = () => {
    router.push(ROUTES.GOOGLE_OAUTH_AUTHORIZE);
  };

  return {
    currentStep,
    ...carousel,
    step1Form,
    step2Form,
    checkDuplicateClicked,
    step2Err,
    otpValue,
    setOtpValue,
    validOTPClicked,
    step3Err,
    handleStep1,
    backToStep1,
    handleStep2,
    backToStep2,
    handleStep3,
    handleGoogleSignup,
  };
}
