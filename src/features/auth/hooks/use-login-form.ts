"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/shared/config/routes";
import { login } from "../api/login-api";
import { type LoginFormData, loginSchema } from "../schemas/login-schema";
import { setToken } from "./set-token";
import { useGoogleAuth } from "./use-google-auth";

export function useLoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({ mode: "all", resolver: zodResolver(loginSchema) });
  const {
    formState: { isValid },
    trigger,
    getValues,
  } = form;
  useGoogleAuth();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const handleSubmitLogin = async () => {
    await trigger();
    if (!isValid) return;
    setSubmitClicked(true);
    const data = getValues();
    const result = await login({
      username: data.loginName.trim(),
      password: data.password.trim(),
    });
    setSubmitClicked(false);

    if (!result || result.statusCode !== 200) {
      setLoginErr(result?.message ?? "Có lỗi xảy ra trong quá trình đăng nhập");
      return;
    }

    const tokens = result.data;
    if (tokens?.accessToken && tokens?.refreshToken) {
      setToken(tokens.accessToken, tokens.refreshToken);
      router.push(ROUTES.HOME);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !submitClicked) {
        event.preventDefault();
        handleSubmitLogin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // biome-ignore lint/correctness/useExhaustiveDependencies: handleSubmitLogin intentionally omitted to avoid re-binding the listener every keystroke
  }, [submitClicked]);

  return {
    form,
    isShowPassword,
    setIsShowPassword,
    submitClicked,
    loginErr,
    handleSubmitLogin,
  };
}
