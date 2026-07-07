"use client";

import { AtSign, Eye, EyeOff, UserRoundIcon } from "lucide-react";
import { LogoNoBG } from "@/shared/components/atoms/icon/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { dayOptions, monthOptions, yearOptions } from "@/shared/config/global-variables";
import { regexEmail, regexName, regexPassword } from "@/shared/config/regex";
import { cn } from "@/shared/lib/utils";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/shared/utils/combine-name";
import { genderOptions, useAdminProfileForm } from "../../hooks/use-admin-profile-form";

export default function AdminProfileEditor() {
  const {
    user,
    form,
    newPassword,
    avatarURL,
    isShowOldPassword,
    isShowNewPassword,
    isShowReNewPassword,
    handleImageUpload,
    handleUpdateProfile,
    toggleOldPasswordVisibility,
    toggleNewPasswordVisibility,
    toggleReNewPasswordVisibility,
    hours,
  } = useAdminProfileForm();

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="relative overflow-hidden bg-background shadow border rounded-lg flex-grow p-10">
      <LogoNoBG
        className="absolute left-0 bottom-0 translate-y-1/2 -rotate-12 size-56"
        fill="fill-gray-3light"
      />

      <h5>
        {hours < 12 && "Chào buổi sáng"}
        {hours >= 12 && hours <= 18 && "Chào buổi chiều"}
        {hours > 18 && "Chào buổi tối"},{" "}
        <span className="text-primary-gradient">
          {combineIntoDisplayName(user.firstName ?? "", user.lastName ?? "")}
        </span>{" "}
        👋
      </h5>
      <p className="text-gray fs-sm">
        Cập nhật thông tin của bạn tại đây. Không chia sẻ thông tin để tránh rủi ro phát sinh.
      </p>

      <div className="max-w-[1080px] mx-auto grid grid-cols-2 gap-10 mt-12">
        <div className="space-y-5">
          <p className="font-medium">Thông tin cá nhân</p>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder=""
                  className={cn("peer custom-input", errors.firstName && "custom-input-error")}
                  tabIndex={0}
                  {...register("firstName", {
                    required: "Tên không được để trống",
                    pattern: {
                      value: regexName,
                      message: "Tên không được chứa số và ký tự đặc biệt",
                    },
                  })}
                />
                <span
                  className={cn(
                    "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                    "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                    errors.firstName
                      ? "text-red-500"
                      : "peer-hover:text-foreground peer-focus:text-foreground",
                  )}
                >
                  Tên
                </span>
              </div>
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.firstName?.message ?? "")}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder=""
                  className={cn("peer custom-input", errors.lastName && "custom-input-error")}
                  tabIndex={0}
                  {...register("lastName", {
                    required: "Họ không được để trống",
                    pattern: {
                      value: regexName,
                      message: "Họ không được chứa số và ký tự đặc biệt",
                    },
                  })}
                />
                <span
                  className={cn(
                    "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                    "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                    errors.lastName
                      ? "text-red-500"
                      : "peer-hover:text-foreground peer-focus:text-foreground",
                  )}
                >
                  Họ
                </span>
              </div>
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.lastName?.message ?? "")}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "day", label: "Ngày", options: dayOptions },
              { name: "month", label: "Tháng", options: monthOptions },
              { name: "year", label: "Năm", options: yearOptions },
            ].map((item) => (
              <label key={item.name} className="block opacity-65">
                <span className="block mb-2 font-medium">{item.label}</span>
                <NativeSelect
                  disabled
                  className="custom-input w-full"
                  {...register(item.name as "day" | "month" | "year")}
                >
                  {Object.entries(item.options).map(([key, value]) => (
                    <NativeSelectOption key={key} value={key}>
                      {String(value)}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </label>
            ))}
          </div>

          <label className="block">
            <span className="block mb-2 font-medium">Giới tính</span>
            <NativeSelect className="custom-input w-full" {...register("gender")}>
              {Object.entries(genderOptions).map(([key, value]) => (
                <NativeSelectOption key={key} value={key}>
                  {value}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </label>

          <div className="p-6 flex items-center gap-6">
            <div className="ring-4 ring-offset-4 rounded-full ring-gray-2light">
              <Avatar className="size-32">
                <AvatarImage src={avatarURL} />
                <AvatarFallback>
                  {combineIntoAvatarName(user.firstName ?? "", user.lastName ?? "")}
                </AvatarFallback>
              </Avatar>
            </div>

            <label
              htmlFor="admin-avatar-upload"
              className="btn-secondary w-fit px-8 py-3 cursor-pointer"
            >
              Thay ảnh đại diện
              <Input
                id="admin-avatar-upload"
                type="file"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-5">
            <p className="font-medium">Thông tin đăng nhập</p>
            <div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder=""
                  className={cn("peer custom-input", errors.username && "custom-input-error")}
                  tabIndex={0}
                  {...register("username", {
                    required: "Tên đăng nhập không được để trống",
                  })}
                />
                <span
                  className={cn(
                    "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                    "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                    errors.username
                      ? "text-red-500"
                      : "peer-hover:text-foreground peer-focus:text-foreground",
                  )}
                >
                  Tên đăng nhập
                </span>
                <div
                  className={cn(
                    "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                    errors.username ? "text-red-500" : "text-muted-foreground",
                  )}
                >
                  <UserRoundIcon className="size-5" />
                </div>
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.username?.message ?? "")}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder=""
                  className={cn("peer custom-input", errors.email && "custom-input-error")}
                  tabIndex={0}
                  {...register("email", {
                    required: "Email không được để trống",
                    pattern: {
                      value: regexEmail,
                      message: "Email không hợp lệ",
                    },
                  })}
                />
                <span
                  className={cn(
                    "fs-sm text-muted-foreground absolute bg-background rounded-sm px-1.5 top-0 left-2 -translate-y-1/2 pointer-events-none",
                    "peer-placeholder-shown:top-1/2 peer-hover:top-0 peer-focus:top-0 transition",
                    errors.email
                      ? "text-red-500"
                      : "peer-hover:text-foreground peer-focus:text-foreground",
                  )}
                >
                  Email
                </span>
                <div
                  className={cn(
                    "absolute top-1/2 right-0 -translate-x-1/2 -translate-y-1/2",
                    errors.email ? "text-red-500" : "text-muted-foreground",
                  )}
                >
                  <AtSign className="size-5" />
                </div>
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{String(errors.email?.message ?? "")}</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <p className="font-medium">Đổi mật khẩu</p>
            <div>
              <div className="relative">
                <Input
                  type={isShowOldPassword ? "text" : "password"}
                  placeholder=""
                  className={cn("peer custom-input", errors.oldPassword && "custom-input-error")}
                  tabIndex={0}
                  {...register("oldPassword", {
                    required: "Mật khẩu không được để trống",
                  })}
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
                    onClick={toggleOldPasswordVisibility}
                  >
                    {!isShowOldPassword ? (
                      <Eye className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
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
                    required: "Mật khẩu mới không được để trống",
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
                    onClick={toggleNewPasswordVisibility}
                  >
                    {!isShowNewPassword ? (
                      <Eye className="size-5" />
                    ) : (
                      <EyeOff className="size-5" />
                    )}
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
                    required: "Mật khẩu nhập lại không được để trống",
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
                  Nhập lại mật khẩu
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
                    onClick={toggleReNewPasswordVisibility}
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

          <Button type="button" className="btn-primary w-full py-3" onClick={handleUpdateProfile}>
            Cập nhật thông tin
          </Button>
        </div>
      </div>
    </div>
  );
}
