"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  type UpdateProfile,
  updateAvatar,
  updateBanner,
  updatePersonalInfo,
} from "@/shared/api/profile/update-profile-api";
import { useProfileImageUpload } from "@/shared/hooks/use-profile-image-upload";
import { ownerAccountStore } from "@/shared/stores/owner-account-store";

export interface ProfileInfo {
  firstName: string;
  lastName: string;
  bio: string;
  gender: string;
  day: string;
  month: string;
  year: string;
  address: string;
}

export const genderOptions: Record<string, string> = {
  "0": "Nam",
  "1": "Nữ",
  "2": "Khác",
  "3": "Không muốn tiết lộ",
};

const defaultValues: ProfileInfo = {
  firstName: "",
  lastName: "",
  bio: "",
  gender: "3",
  day: "1",
  month: "1",
  year: "2000",
  address: "",
};

function getDobParts(dob?: string | null) {
  let day = "1";
  let month = "1";
  let year = "2000";

  if (!dob) return { day, month, year };

  try {
    const dobDate = new Date(dob);
    if (!Number.isNaN(dobDate.getTime())) {
      day = String(dobDate.getDate());
      month = String(dobDate.getMonth() + 1);
      year = String(dobDate.getFullYear());
    }
  } catch (_error) {}

  return { day, month, year };
}

export function useAccountBasicForm() {
  const { user, setUser } = ownerAccountStore();
  const [isEditing, setIsEditing] = useState(false);
  const { selectImageFile, uploadImage } = useProfileImageUpload();

  const form = useForm<ProfileInfo>({
    mode: "onChange",
    defaultValues,
  });

  const { getValues, reset } = form;

  useEffect(() => {
    if (!user.id) return;
    const { day, month, year } = getDobParts(user.dob);

    reset({
      ...getValues(),
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      gender: user.gender !== undefined ? String(user.gender) : "3",
      day,
      month,
      year,
      address: user.address || "",
    });
  }, [user, reset, getValues]);

  const handleSelectBanner = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(event);
    if (!selected) return;
    uploadImage(selected.file, selected.previewURL, {
      uploadFn: updateBanner,
      optimisticField: "banner",
      successMessage: "Đã cập nhật ảnh bìa",
      errorMessage: "Cập nhật ảnh bìa thất bại",
      toastOnFalsyResponse: false,
    });
  };

  const handleSelectAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = selectImageFile(event);
    if (!selected) return;
    uploadImage(selected.file, selected.previewURL, {
      uploadFn: updateAvatar,
      optimisticField: "avatar",
      successMessage: "Đã cập nhật ảnh đại diện",
      errorMessage: "Cập nhật ảnh đại diện thất bại",
    });
  };

  const onSubmit = async (data: ProfileInfo) => {
    if (!isEditing) return;

    const dobString = `${data.year}-${data.month.padStart(2, "0")}-${data.day.padStart(2, "0")}`;

    try {
      const updateData: UpdateProfile = {
        firstName: data.firstName,
        lastName: data.lastName,
        bio: data.bio,
        address: data.address,
        dob: dobString,
      };

      const resp = await updatePersonalInfo(updateData);
      if (resp) {
        toast.success("Đã cập nhật thông tin");
        reset(getValues());
        setIsEditing(false);
        setUser({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          dob: dobString,
          address: data.address,
        });
      } else {
        toast.error("Cập nhật thông tin thất bại");
      }
    } catch (_error) {
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleStartEditing = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsEditing(true);
  };

  return {
    user,
    form,
    isEditing,
    handleStartEditing,
    handleSelectBanner,
    handleSelectAvatar,
    onSubmit,
  };
}
