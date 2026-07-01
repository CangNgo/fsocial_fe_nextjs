"use client";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { changePassword } from "@/shared/api/auth/change-password-api";
import { LoadingIcon } from "@/shared/components/atoms/icon/icon";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { regexPassword } from "@/shared/config/regex";
import { cn } from "@/shared/lib/utils";
import { usePopupStore } from "@/shared/stores/popup-store";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  reNewPassword: string;
}

export function ChangePasswordModal() {
  const router = useRouter();
  const { hidePopup } = usePopupStore();
  const {
    register,
    getValues,
    watch,
    formState: { errors, isValid },
    trigger,
  } = useForm<ChangePasswordForm>({ mode: "all" });
  const newPassword = watch("newPassword");

  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowReNewPassword, setIsShowReNewPassword] = useState(false);
  const [submitClicked, setSubmitClicked] = useState(false);

  const gotoForgetPassword = () => {
    hidePopup();
    router.push("/forgot-password");
  };

  const handleChangePassword = async () => {
    await trigger();
    if (!isValid) return;
    setSubmitClicked(true);
    const formData = getValues();
    const resp = (await changePassword({
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    })) as { statusCode?: number } | null;
    setSubmitClicked(false);
    if (!resp || resp.statusCode !== 200) {
      toast.error("Đã có lỗi xảy ra trong quá trình đổi mật khẩu");
      return;
    }
    toast.success("Đổi mật khẩu thành công");
    hidePopup();
  };

  return (
    <div className="relative pt-10 flex flex-col bg-background sm:w-[500px] sm:h-fit w-screen h-[100dvh]">
      <div className="flex-grow space-y-5 px-7 pb-7">
        <div>
          <h4>Đổi mật khẩu</h4>
          <p className="text-muted-foreground">Luôn giữ bảo mật cho tài khoản của bạn</p>
        </div>
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Input
                type={isShowOldPassword ? "text" : "password"}
                placeholder=""
                className={cn("peer custom-input", errors.oldPassword && "custom-input-error")}
                tabIndex={0}
                {...register("oldPassword", { required: "Mật khẩu không được để trống" })}
              />
              <span
                className={cn(
                  "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                  "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                  errors.oldPassword
                    ? "text-red-500"
                    : "peer-hover:text-foreground peer-focus:text-foreground",
                )}
              >
                Mật khẩu cũ
              </span>
              <div
                className={cn(
                  "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                  errors.oldPassword ? "text-red-500" : "text-muted-foreground",
                )}
              >
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setIsShowOldPassword(!isShowOldPassword)}
                >
                  {!isShowOldPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </Button>
              </div>
            </div>
            {errors.oldPassword && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.oldPassword?.message ?? "")}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                type={isShowNewPassword ? "text" : "password"}
                placeholder=""
                className={cn("peer custom-input", errors.newPassword && "custom-input-error")}
                tabIndex={0}
                {...register("newPassword", {
                  required: "Mật khẩu không được để trống",
                  pattern: {
                    value: regexPassword,
                    message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
                  },
                })}
              />
              <span
                className={cn(
                  "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                  "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                  errors.newPassword
                    ? "text-red-500"
                    : "peer-hover:text-foreground peer-focus:text-foreground",
                )}
              >
                Mật khẩu mới
              </span>
              <div
                className={cn(
                  "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                  errors.newPassword ? "text-red-500" : "text-muted-foreground",
                )}
              >
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setIsShowNewPassword(!isShowNewPassword)}
                >
                  {!isShowNewPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                </Button>
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.newPassword?.message ?? "")}
              </p>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                type={isShowReNewPassword ? "text" : "password"}
                placeholder=""
                className={cn("peer custom-input", errors.reNewPassword && "custom-input-error")}
                tabIndex={0}
                {...register("reNewPassword", {
                  required: "Mật khẩu không được để trống",
                  validate: (value) => value === newPassword || "Mật khẩu nhập lại không khớp",
                })}
              />
              <span
                className={cn(
                  "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                  "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                  errors.reNewPassword
                    ? "text-red-500"
                    : "peer-hover:text-foreground peer-focus:text-foreground",
                )}
              >
                Nhập lại mật khẩu mới
              </span>
              <div
                className={cn(
                  "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                  errors.reNewPassword ? "text-red-500" : "text-muted-foreground",
                )}
              >
                <Button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setIsShowReNewPassword(!isShowReNewPassword)}
                >
                  {!isShowReNewPassword ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </Button>
              </div>
            </div>
            {errors.reNewPassword && (
              <p className="text-red-500 text-sm mt-1">
                {String(errors.reNewPassword?.message ?? "")}
              </p>
            )}
          </div>
        </div>
        <div>
          <Button
            type="button"
            className="mb-2 underline font-semibold"
            onClick={gotoForgetPassword}
          >
            Quên mật khẩu?
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="btn-primary py-3 mb-3 w-full"
            onClick={handleChangePassword}
          >
            {submitClicked ? <LoadingIcon /> : "Xác nhận thay đổi"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="btn-secondary py-3 w-full"
            onClick={hidePopup}
          >
            Hủy bỏ
          </Button>
        </div>
      </div>
    </div>
  );
}
