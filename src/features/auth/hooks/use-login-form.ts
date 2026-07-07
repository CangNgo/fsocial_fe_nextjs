"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/shared/config/routes";
import { useLoginMutation } from "./mutations/use-login-mutations";
import { type LoginFormData, loginSchema } from "../schemas/login-schema";
import { setToken } from "./set-token";

export function useLoginForm() {
  const router = useRouter();
  const form = useForm<LoginFormData>({ mode: "all", resolver: zodResolver(loginSchema) });
  const {
    formState: { isValid },
    trigger,
    getValues,
  } = form;

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const { mutateAsync: login, isPending: submitClicked } = useLoginMutation();

  const handleSubmitLogin = useCallback(async () => {
    await trigger();
    if (!isValid) return;
    const data = getValues();
    const result = await login({
      username: data.loginName.trim(),
      password: data.password.trim(),
    });

    if (result?.statusCode !== 200) {
      setLoginErr(result?.message ?? "Có lỗi xảy ra trong quá trình đăng nhập");
      return;
    }

    const tokens = result.data;
    if (tokens?.accessToken && tokens?.refreshToken) {
      setToken(tokens.accessToken, tokens.refreshToken);
      router.push(ROUTES.HOME);
    }
  }, [getValues, isValid, login, router, trigger]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !submitClicked) {
        event.preventDefault();
        handleSubmitLogin();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [submitClicked, handleSubmitLogin]);

  return {
    form,
    isShowPassword,
    setIsShowPassword,
    submitClicked,
    loginErr,
    handleSubmitLogin,
  };
}
