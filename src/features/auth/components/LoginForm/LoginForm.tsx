"use client";
import { Eye, EyeOff, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { LoadingIcon } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/input";
import { login } from "@/lib/api/auth/loginApi";
import { cn } from "@/lib/utils";
import { validRefreshTokenStore } from "@/store/validRefreshTokenStore";
import { getCookie, setCookie } from "@/utils/cookie";

interface LoginFormData {
  loginName: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const { setRefreshToken } = validRefreshTokenStore();
  const {
    register,
    formState: { errors, isValid },
    trigger,
    getValues,
  } = useForm<LoginFormData>({ mode: "all" });

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
    console.log("result : ", result);
    if (!result || result.statusCode !== 200) {
      setLoginErr(result?.message ?? "Có lỗi xảy ra trong quá trình đăng nhập");
      return;
    }

    const tokens = result.data;
    if (tokens?.accessToken && tokens?.refreshToken) {
      setCookie("access-token", tokens.accessToken, 1);
      setCookie("refresh-token", tokens.refreshToken, 10);
      console.log("token: ", getCookie("access-token"));
      setRefreshToken(tokens.refreshToken);
      router.push("/home");
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL;
    if (googleLoginUrl) {
      window.location.href = googleLoginUrl;
    } else {
      toast.error("Không thể login bằng Google, vui lòng thử lại sau");
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
  }, [submitClicked, handleSubmitLogin]);

  return (
    <div className="flex items-center justify-center max-w-[1440px] mx-auto min-h-[100dvh] md:px-6 md:gap-20 md:flex-nowrap bg-background gap-4 flex-wrap">
      <div className="h-fit w-[440px] rounded-lg bg-background sm:border sm:shadow-lg sm:px-8 sm:py-10 p-6">
        <div className="mb-4">
          <h2>
            Chào mừng đến với{" "}
            <span className="font-bold text-2xl bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
              FSocial
            </span>
            👋
          </h2>
          <span className="text-muted-foreground">Nền tảng mạng xã hội giới trẻ mới</span>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder=""
              className={cn("peer custom-input", errors.loginName && "custom-input-error")}
              tabIndex={0}
              {...register("loginName", { required: "Tên đăng nhập/email không được để trống" })}
            />
            <span
              className={cn(
                "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                errors.loginName
                  ? "text-red-500"
                  : "peer-hover:text-foreground peer-focus:text-foreground",
              )}
            >
              Tên đăng nhập/Email
            </span>
            <div
              className={cn(
                "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                errors.loginName ? "text-red-500" : "text-muted-foreground",
              )}
            >
              <UserRoundIcon className="size-5" />
            </div>
          </div>
          {errors.loginName && (
            <p className="text-red-500 text-sm mt-1">{String(errors.loginName?.message ?? "")}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="relative">
            <Input
              type={isShowPassword ? "text" : "password"}
              placeholder=""
              className={cn("peer custom-input", errors.password && "custom-input-error")}
              tabIndex={0}
              {...register("password", { required: "Mật khẩu không được để trống" })}
            />
            <span
              className={cn(
                "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                errors.password
                  ? "text-red-500"
                  : "peer-hover:text-foreground peer-focus:text-foreground",
              )}
            >
              Mật khẩu
            </span>
            <div
              className={cn(
                "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                errors.password ? "text-red-500" : "text-muted-foreground",
              )}
            >
              {!isShowPassword ? (
                <Eye className="size-5 cursor-pointer" onClick={() => setIsShowPassword(true)} />
              ) : (
                <EyeOff
                  className="size-5 cursor-pointer"
                  onClick={() => setIsShowPassword(false)}
                />
              )}
            </div>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{String(errors.password?.message ?? "")}</p>
          )}
        </div>

        <div className="flex justify-between mb-2">
          <Link href="/forgot-password" className="underline text-sm font-semibold">
            Quên mật khẩu?
          </Link>
        </div>

        <div className="mb-4">
          {!submitClicked && loginErr && <p className="text-red-600 text-sm mb-2">{loginErr}</p>}
          <Button type="button" className="btn-primary py-3 w-full" onClick={handleSubmitLogin}>
            {submitClicked ? <LoadingIcon /> : "Đăng nhập"}
          </Button>
        </div>

        <div className="flex items-center justify-center my-6">
          <div className="border-t flex-grow" />
          <span className="px-4 text-muted-foreground text-sm">Hoặc</span>
          <div className="border-t flex-grow" />
        </div>

        <div className="mb-4">
          <Button
            type="button"
            className="btn-outline mb-5 gap-3 py-3 w-full flex items-center justify-center"
            onClick={handleGoogleLogin}
          >
            <img className="size-6" src="/decor/google_icon.svg" alt="" />
            Đăng nhập với Google
          </Button>
        </div>

        <div className="flex justify-center items-center">
          <span className="text-muted-foreground text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/signup" className="underline cursor-pointer font-semibold">
              Tạo tài khoản mới
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
