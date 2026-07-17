"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAdminProfile } from "@/features/admin/hooks/queries/use-admin-profile";
import { adminKeys } from "@/services/admin/admin.key";
import { changePassword } from "@/services/auth/change-password-api";
import {
  type ProfileUpdateResponse,
  updateAvatar,
  updatePersonalInfo,
} from "@/services/profile/update-profile-api";
import { adminStore } from "@/shared/stores/admin-store";
import type { ApiResponse } from "@/shared/types/api-response";
import { adminProfileSchema, type AdminProfileFormValues } from "../schemas/admin-profile-schema";

export const genderOptions: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
  "3": "Không muốn tiết lộ",
};

function getDobParts(dob?: string) {
  if (!dob) {
    return { day: "", month: "", year: "" };
  }

  const [year = "", month = "", day = ""] = dob.split("-");
  return {
    day: day ? String(Number(day)) : "",
    month: month ? String(Number(month)) : "",
    year,
  };
}

export function useAdminProfileForm() {
  const { user, setUser } = adminStore();
  const profileQuery = useAdminProfile();
  const queryClient = useQueryClient();
  const form = useForm<AdminProfileFormValues>({
    mode: "all",
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      day: "",
      month: "",
      year: "",
      gender: "3",
      username: "",
      email: "",
      address: "",
      avatar: "",
      oldPassword: "",
      newPassword: "",
      reNewPassword: "",
    },
  });
  const { reset, setValue, watch, handleSubmit } = form;

  const avatar = watch("avatar");

  const [isShowOldPassword, setIsShowOldPassword] = useState(false);
  const [isShowNewPassword, setIsShowNewPassword] = useState(false);
  const [isShowReNewPassword, setIsShowReNewPassword] = useState(false);

  const updateProfileMutation = useMutation({
    mutationFn: updatePersonalInfo,
    onSuccess: async (response) => {
      if ((response?.statusCode && response.statusCode >= 400) || !response?.data) {
        toast.error(response?.message ?? "Cập nhật thông tin thất bại");
        return;
      }

      setUser({
        firstName: response.data.firstName ?? "",
        lastName: response.data.lastName ?? "",
        dob: response.data.dob ?? "",
        gender: response.data.gender ?? 3,
        username: response.data.username ?? "",
        email: response.data.email ?? "",
        avatar: response.data.avatar ?? "",
        address: response.data.address ?? "",
      });
      await queryClient.invalidateQueries({ queryKey: adminKeys.users });
      toast.success(response.message ?? "Cập nhật thông tin thành công");
    },
    onError: () => {
      toast.error("Cập nhật thông tin thất bại");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      if (response?.statusCode && response.statusCode >= 400) {
        toast.error(response.message ?? "Đổi mật khẩu thất bại");
        return;
      }

      if (!response) {
        toast.error("Đổi mật khẩu thất bại");
        return;
      }

      toast.success(response.message ?? "Đổi mật khẩu thành công");
    },
    onError: () => {
      toast.error("Đổi mật khẩu thất bại");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: updateAvatar,
    onSuccess: async (response: ApiResponse<ProfileUpdateResponse> | null) => {
      if ((response?.statusCode && response.statusCode >= 400) || !response?.data) {
        toast.error(response?.message ?? "Cập nhật ảnh đại diện thất bại");
        return;
      }

      const nextAvatar = response.data.avatar ?? avatar;
      setUser({ avatar: nextAvatar ?? "" });
      setValue("avatar", nextAvatar ?? "", { shouldDirty: false });
      await queryClient.invalidateQueries({ queryKey: adminKeys.users });
      toast.success(response.message ?? "Cập nhật ảnh đại diện thành công");
    },
    onError: () => {
      toast.error("Cập nhật ảnh đại diện thất bại");
    },
  });

  useEffect(() => {
    const { day, month, year } = getDobParts(user.dob);

    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      day,
      month,
      year,
      gender: user.gender !== undefined ? String(user.gender) : "3",
      username: user.username ?? "",
      email: user.email ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
      oldPassword: "",
      newPassword: "",
      reNewPassword: "",
    });
  }, [user, reset]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setValue("avatar", imageUrl);
    await updateAvatarMutation.mutateAsync(file);
  };

  const handleUpdateProfile = handleSubmit(async (values) => {
    const dob = values.year && values.month && values.day
      ? `${values.year}-${values.month.padStart(2, "0")}-${values.day.padStart(2, "0")}`
      : undefined;

    const profileResponse = await updateProfileMutation.mutateAsync({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      address: values.address.trim(),
      dob,
      gender: Number(values.gender),
    });

    if ((profileResponse?.statusCode && profileResponse.statusCode >= 400) || !profileResponse?.data) {
      return;
    }

    if (values.oldPassword && values.newPassword) {
      const passwordResponse = await changePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      if (passwordResponse?.statusCode && passwordResponse.statusCode >= 400) {
        return;
      }
    }

    reset(
      {
        ...values,
        oldPassword: "",
        newPassword: "",
        reNewPassword: "",
      },
      { keepDirty: false },
    );
  });

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
    avatar,
    isLoading: profileQuery.isPending,
    isError: profileQuery.isError,
    isSubmitting:
      updateProfileMutation.isPending ||
      changePasswordMutation.isPending ||
      updateAvatarMutation.isPending,
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
