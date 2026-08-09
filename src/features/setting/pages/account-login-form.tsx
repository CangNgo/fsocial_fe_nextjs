"use client";

import { AtSign, UserRound } from "lucide-react";
import { useEffect } from "react";
import { Image } from "@/shared/components/atoms/image";
import { useForm } from "react-hook-form";
import { ChangePasswordModal } from "@/shared/components/organisms/change-password-modal";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";
import { usePopupStore } from "@/shared/stores/popup-store";

interface LoginFormValues {
  username: string;
  email: string;
  password: string;
}

export default function AccountLoginForm() {
  const { showPopup } = usePopupStore();
  const user = ownerAccountStore((state) => state.user);

  const { register, reset } = useForm<LoginFormValues>({ mode: "all" });

  const handlePopupChangePassword = () => {
    showPopup(null, <ChangePasswordModal />);
  };

  useEffect(() => {
    if (!user.id) return;
    reset({
      username: user.username,
      email: user.email,
      password: "****************",
    });
  }, [user.id, user.username, user.email, reset]);

  return (
    <div className="mt-16 flex gap-12">
      <div>
        <p className="mb-5">Tiết lộ thông tin đăng nhập có thể dẫn tới mất tài khoản.</p>
        <form className="space-y-5">
          <div className={cn("pointer-events-none opacity-65")}>
            <div className="relative">
              <Input
                type="text"
                placeholder=""
                className={cn("peer custom-input", "pointer-events-none")}
                tabIndex={-1}
                {...register("username")}
              />
              <span
                className={cn(
                  "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                  "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                  "peer-hover:text-foreground peer-focus:text-foreground",
                )}
              >
                Tên đăng nhập
              </span>
              <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                <UserRound className="size-5" />
              </div>
            </div>
          </div>
          <div className={cn("pointer-events-none opacity-65")}>
            <div className="relative">
              <Input
                type="text"
                placeholder=""
                className={cn("peer custom-input", "pointer-events-none")}
                tabIndex={-1}
                {...register("email")}
              />
              <span
                className={cn(
                  "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                  "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                  "peer-hover:text-foreground peer-focus:text-foreground",
                )}
              >
                Email
              </span>
              <div className="absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground">
                <AtSign className="size-5" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex gap-2">
              <div className={cn("flex-grow", "pointer-events-none opacity-65")}>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder=""
                    className={cn("peer custom-input", "pointer-events-none")}
                    tabIndex={-1}
                    {...register("password")}
                  />
                  <span
                    className={cn(
                      "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                      "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                      "peer-hover:text-foreground peer-focus:text-foreground",
                    )}
                  >
                    Mật khẩu
                  </span>
                </div>
              </div>
              <Button type="button" className="btn-ghost w-32" onClick={handlePopupChangePassword}>
                Đổi mật khẩu
              </Button>
            </div>
            <p className="fs-sm text-gray">*Vì lý do bảo mật, mật khẩu sẽ không được hiển thị</p>
          </div>
        </form>
      </div>
      <Image
        className="max-w-80 h-auto"
        src="/decor/account_login_info_decor.svg"
        alt=""
        width={0}
        height={0}
        sizes="320px"
      />
    </div>
  );
}
