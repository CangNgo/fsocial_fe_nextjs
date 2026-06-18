// @ts-nocheck
"use client";

import { AtSign, ChevronDown, Eye, EyeOff, UserRoundIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { LogoNoBG } from "@/components/atoms/Icon";
import { Input } from "@/components/atoms/input";
import { JumpingSelect } from "@/components/atoms/JumpingInput";
import { dayOptions, monthOptions, yearOptions } from "@/config/globalVariables";
import { regexEmail, regexName, regexPassword } from "@/config/regex";
import { cn } from "@/lib/utils";
import { adminStore } from "@/store/adminStore";
import { combineIntoAvatarName, combineIntoDisplayName } from "@/utils/combineName";

interface AdminProfileFormValues {
  firstName: string;
  lastName: string;
  day: string;
  month: string;
  year: string;
  gender: string;
  username: string;
  email: string;
  avatar: string;
  oldPassword: string;
  newPassword: string;
  reNewPassword: string;
}

export function AdminProfileEditor() {
  const { user } = adminStore();
  const {
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AdminProfileFormValues>({ mode: "all" });

  const newPassword = watch("newPassword");
  const avatarURL = watch("avatar");

  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowReNewPassword, setIsShowReNewPassword] = useState(false);

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      day: user.day,
      month: user.month,
      year: user.year,
      gender: user.gender,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user.year,
    user.username,
    user.gender,
    user.month,
    user.firstName,
    user.avatar,
    user.lastName,
    user.email,
    user.day,
    reset,
  ]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setValue("avatar", imageUrl);
    }
  };

  const handleUpdateProfile = () => {
    // TODO: call profile update API
  };

  const toggleOldPasswordVisibility = () => {
    setIsShowOldPassword((prev) => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setIsShowNewPassword((prev) => !prev);
  };

  const toggleReNewPasswordVisibility = () => {
    setIsShowReNewPassword((prev) => !prev);
  };

  const hours = new Date().getHours();

  const genderOptions: Record<string, string> = {
    "0": "Nam",
    "1": "Nữ",
    "2": "Khác",
    "3": "Không muốn tiết lộ",
  };

  return (
    <div className="relative overflow-hidden bg-background shadow border rounded-lg flex-grow p-10">
      <LogoNoBG
        className="absolute left-0 bottom-0 translate-y-1/2 -rotate-12 size-56"
        fill="fill-gray-3light"
      />

      {/* Header greeting */}
      <h5>
        {hours < 12 && "Chào buổi sáng"}
        {hours >= 12 && hours <= 18 && "Chào buổi chiều"}
        {hours > 18 && "Chào buổi tối"},{" "}
        <span className="text-primary-gradient">
          {combineIntoDisplayName(user.firstName, user.lastName)}
        </span>{" "}
        👋
      </h5>
      <p className="text-gray fs-sm">
        Cập nhật thông tin của bạn tại đây. Không chia sẻ thông tin để tránh rủi ro phát sinh.
      </p>

      {/* Form */}
      <div className="max-w-[1080px] mx-auto grid grid-cols-2 gap-10 mt-12">
        {/* Personal info */}
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
            <JumpingSelect
              label="Ngày"
              name="day"
              register={register as never}
              errors={errors as never}
              options={dayOptions}
              disabled={true}
              icon={<ChevronDown />}
            />
            <JumpingSelect
              label="Tháng"
              name="month"
              register={register as never}
              errors={errors as never}
              options={monthOptions}
              disabled={true}
              icon={<ChevronDown />}
            />
            <JumpingSelect
              label="Năm"
              name="year"
              register={register as never}
              errors={errors as never}
              options={yearOptions}
              disabled={true}
              icon={<ChevronDown />}
            />
          </div>

          <JumpingSelect
            label="Giới tính"
            name="gender"
            register={register as never}
            errors={errors as never}
            options={genderOptions}
            icon={<ChevronDown />}
          />

          {/* Avatar */}
          <div className="p-6 flex items-center gap-6">
            <div className="ring-4 ring-offset-4 rounded-full ring-gray-2light">
              <Avatar className="size-32">
                <AvatarImage src={avatarURL} />
                <AvatarFallback>
                  {combineIntoAvatarName(user.firstName, user.lastName)}
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
          {/* Login info */}
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

          {/* Change password */}
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
                    required: "Mật khẩu không được để trống",
                    pattern: {
                      value: regexPassword,
                      message: "Mật khẩu từ 8-20 kí tự, bao gồm cả chữ và số",
                    },
                    validate: (value: string) =>
                      value === newPassword || "Mật khẩu nhập lại không khớp với mật khẩu mới",
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
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button type="button" onClick={handleUpdateProfile} className="btn-primary px-8 py-3 w-fit">
          Cập nhật thay đổi
        </Button>
      </div>
    </div>
  );
}
