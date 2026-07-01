"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { login } from "../api/login-api";
import { setToken } from "./set-token";
import { useGoogleAuth } from "./use-google-auth";

interface LoginFormData {
  loginName: string;
  password: string;
}

export function useLoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({ mode: "all" });
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
      router.push("/home");
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
