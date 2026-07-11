"use client";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { FormInput } from "@/shared/components/molecules/form-input";
import { Button } from "@/shared/components/ui/button";
import { ROUTES } from "@/shared/config/routes";
import { UserRoundIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLoginForm } from "../../hooks/use-login-form";
import GoogleSignInButton from "../molecules/google-sign-in-button";

export default function LoginForm() {
  const {
    form: {
      register,
      formState: { errors },
    },
    submitClicked,
    loginErr,
    handleSubmitLogin,
  } = useLoginForm();

  return (
    <div className="relative min-h-[100dvh] bg-background overflow-hidden">
      <div className="absolute inset-0 pointer-events-none top-0 select-none" aria-hidden="true">
        <Image
          src="/logo/background-login3.png"
          alt=""
          fill
          priority
          className="object-cover object-bottom"
        />
      </div>
      <div className="relative z-10 flex items-center justify-center max-w-[1440px] mx-auto min-h-[100dvh] md:px-6 md:gap-20 md:flex-nowrap gap-4 flex-wrap">
        <div className="relative z-10 h-fit w-[390px] rounded-lg bg-background/50 backdrop-blur-md sm:border sm:shadow-lg sm:px-8 sm:py-10 p-6">
          <div className="mb-4">
            <h2>
              Chào mừng đến với{" "}
              <span className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                FlowZone
              </span>
              👋
            </h2>
            <span className="text-muted-foreground">Nền tảng mạng xã hội giới trẻ mới</span>
          </div>

          <div className="mb-4">
            <FormInput
              type="text"
              label="Tên đăng nhập/Email"
              icon={<UserRoundIcon className="size-5" />}
              error={String(errors.loginName?.message ?? "")}
              {...register("loginName")}
            />
          </div>

          <div className="mb-4">
            <FormInput
              type="password"
              label="Mật khẩu"
              error={String(errors.password?.message ?? "")}
              {...register("password")}
            />
          </div>

          <div className="flex justify-between mb-2">
            <Link href={ROUTES.FORGOT_PASSWORD} className="underline text-sm font-semibold">
              Quên mật khẩu?
            </Link>
          </div>

          <div className="mb-4">
            {!submitClicked && loginErr && <p className="text-red-600 text-sm mb-2">{loginErr}</p>}
            <Button
              type="button"
              className="btn-primary py-5 text-lg w-full"
              onClick={handleSubmitLogin}
            >
              {submitClicked ? <LoadingIcon /> : "Đăng nhập"}
            </Button>
          </div>

          <div className="flex items-center justify-center my-6">
            <div className="border-t flex-grow" />
            <span className="px-4 text-muted-foreground text-sm">Hoặc</span>
            <div className="border-t flex-grow" />
          </div>

          <div className="mb-4">
            <GoogleSignInButton />
          </div>

          <div className="flex justify-center items-center">
            <span className="text-muted-foreground text-sm">
              Chưa có tài khoản?{" "}
              <Link href={ROUTES.SIGNUP} className="underline cursor-pointer font-semibold">
                Tạo tài khoản mới
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
