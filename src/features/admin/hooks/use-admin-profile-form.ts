"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { adminStore } from "@/shared/stores/admin-store";

export interface AdminProfileFormValues {
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

export const genderOptions: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
  "3": "Không muốn tiết lộ",
};

export function useAdminProfileForm() {
  const { user } = adminStore();
  const form = useForm<AdminProfileFormValues>({ mode: "all" });
  const { reset, setValue, watch } = form;

  const newPassword = watch("newPassword");
  const avatarURL = watch("avatar");

  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowReNewPassword, setIsShowReNewPassword] = useState(false);

  useEffect(() => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      day: user.day ? String(user.day) : undefined,
      month: user.month,
      year: user.year ? String(user.year) : undefined,
      gender: user.gender !== undefined ? String(user.gender) : undefined,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  }, [user, reset]);

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

  return {
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
  };
}
